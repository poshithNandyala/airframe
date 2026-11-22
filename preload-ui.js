'use strict';

const { contextBridge, ipcRenderer } = require('electron');

function subscribe(channel, callback) {
  const listener = (_event, payload) => {
    try {
      callback(payload);
    } catch (err) {
      console.warn(`[airframe] UI listener failed (${channel}):`, err.message);
    }
  };
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld('airframe', {
  getState: () => ipcRenderer.invoke('airframe:get-state'),
  act: (type) => ipcRenderer.invoke('airframe:action', { type }),
  onState: (callback) => subscribe('airframe:state', callback),
  onToast: (callback) => subscribe('airframe:toast', callback),
  onLoading: (callback) => subscribe('airframe:loading', callback),
  onMode: (callback) => subscribe('airframe:mode', callback),
});
