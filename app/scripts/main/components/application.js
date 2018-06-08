'use strict'


/**
 * Modules
 * Node
 * @constant
 */
const events = require('events')
const path = require('path')

/**
 * Modules
 * Electron
 * @constant
 */
const electron = require('electron')
const { app, BrowserWindow } = electron

/**
 * Modules
 * External
 * @constant
 */
const appRootPath = require('app-root-path')
appRootPath.setPath(path.join(__dirname, '..', '..', '..', '..'))
global.requireLibrary = appRootPath.require
const logger = require('@sidneys/logger')({ write: true })
const platformTools = require('@sidneys/platform-tools')
/* eslint-disable no-unused-vars */
const debugService = require('@sidneys/electron-debug-service')
const updaterService = require('@sidneys/electron-updater-service')
/* eslint-enable */

/**
 * Modules
 * Configuration
 */

/**
 * Modules
 * Internal
 * @constant
 */
/* eslint-disable no-unused-vars */
const globals = requireLibrary('./app/scripts/main/components/globals')
/* eslint-enable */

/**
 * Modules
 * Configuration
 */
app.disableHardwareAcceleration()
app.dock.hide()
events.EventEmitter.defaultMaxListeners = Infinity

// Hotfix for skipped notifications (Windows) (https://github.com/electron/electron/issues/11340)
if (platformTools.isWindows) {
    app.setAppUserModelId(global.manifest.appId)
}

/**
 * Modules
 * Internal
 * @constant
 */
/* eslint-disable no-unused-vars */
const appMenu = require(path.join(appRootPath.path, 'app', 'scripts', 'main', 'menus', 'app-menu'))
const configurationManager = require(path.join(appRootPath.path, 'app', 'scripts', 'main', 'managers', 'configuration-manager'))
const trayMenu = require(path.join(appRootPath.path, 'app', 'scripts', 'main', 'menus', 'tray-menu'))
/* eslint-enable */


/**
 * @listens Electron.App#ready
 */
app.once('ready', () => {
    logger.debug('app#ready')
})

/**
 * Ensure single instance
 */
const isSecondInstance = app.makeSingleInstance(() => {
    logger.debug('isSecondInstance', 'primary instance')

    logger.warn('Multiple application instances detected', app.getPath('exe'))
    logger.warn('Multiple application instances detected', 'Restoring primary application instance')

    BrowserWindow.getAllWindows().forEach((browserWindow) => {
        browserWindow.restore()
        app.focus()
    })
})

if (isSecondInstance) {
    logger.debug('isSecondInstance', 'secondary instance')

    logger.warn('Multiple application instances detected', app.getPath('exe'))
    logger.warn('Multiple application instances detected', 'Shutting down secondary application instances')

    process.exit(0)
}
