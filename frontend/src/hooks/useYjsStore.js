import { createTLStore, defaultShapeUtils } from 'tldraw'
import { useEffect, useState } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

export function useYjsStore({ 
  roomId = 'example', 
  hostUrl = import.meta.env.VITE_YJS_URL || 'wss://demos.yjs.dev/ws'
}) {
  const [store] = useState(() => createTLStore({ shapeUtils: [...defaultShapeUtils] }))
  const [storeWithStatus, setStoreWithStatus] = useState({ status: 'loading' })

  useEffect(() => {
    setStoreWithStatus({ status: 'loading' })
    const yDoc = new Y.Doc({ gc: true })
    const yMap = yDoc.getMap(`tl_${roomId}`)
    
    // WebsocketProvider creates a connection to the sync server
    const room = new WebsocketProvider(hostUrl, roomId, yDoc)

    const unsubs = []

    function handleSync() {
      // 1. Sync local tldraw changes to the Yjs map
      unsubs.push(
        store.listen(
          ({ changes }) => {
            yDoc.transact(() => {
              Object.values(changes.added).forEach((r) => yMap.set(r.id, r))
              Object.values(changes.updated).forEach(([_, r]) => yMap.set(r.id, r))
              Object.values(changes.removed).forEach((r) => yMap.delete(r.id))
            })
          },
          { source: 'user', scope: 'document' } // only sync user's document changes
        )
      )

      // 2. Sync incoming Yjs remote changes to the tldraw store
      const handleChange = (event, transaction) => {
        if (transaction.local) return
        const toPut = []
        const toRemove = []

        event.keys.forEach((change, key) => {
          if (change.action === 'add' || change.action === 'update') {
            toPut.push(yMap.get(key))
          } else if (change.action === 'delete') {
            toRemove.push(key)
          }
        })

        store.mergeRemoteChanges(() => {
          if (toRemove.length) store.remove(toRemove)
          if (toPut.length) store.put(toPut)
        })
      }

      yMap.observe(handleChange)
      unsubs.push(() => yMap.unobserve(handleChange))

      setStoreWithStatus({
        store,
        status: 'synced-remote',
        connectionStatus: 'online',
      })
    }

    // Initialize tldraw store with existing data from yMap before syncing
    const initStore = () => {
      const records = Array.from(yMap.values())
      if (records.length) {
        store.mergeRemoteChanges(() => {
          store.put(records)
        })
      }
    }

    let hasSynced = false
    room.on('sync', (isSynced) => {
      if (isSynced && !hasSynced) {
        hasSynced = true
        initStore()
        handleSync()
      }
    })

    return () => {
      unsubs.forEach((fn) => fn())
      room.destroy()
      yDoc.destroy()
    }
  }, [roomId, hostUrl, store])

  return storeWithStatus
}
