'use strict'


/**
 * Modules
 * Node
 * @constant
 */
const path = require('path')

/**
 * Modules
 * Electron
 * @constant
 */
const { app, Menu, Tray } = require('electron')

/**
 * Modules
 * External
 * @constant
 */
const appRootPath = require('app-root-path')['path']
const logger = require('@sidneys/logger')({ write: true })
const platformTools = require('@sidneys/platform-tools')
const keyboard = require('macos-accessibility-keyboard')

/**
 * Modules
 * Internal
 * @constant
 */
const configurationManager = require(path.join(appRootPath, 'app', 'scripts', 'main', 'managers', 'configuration-manager'));

/**
 * Application
 * @constant
 * @default
 */
const appCurrentVersion = global.manifest.version
const appProductName = global.manifest.productName

/**
 * Tray icons
 * @constant
 */
const trayIconOn = path.join(appRootPath, 'app', 'images', `${platformTools.type}-tray-icon-on${platformTools.templateImageExtension(platformTools.type)}`)
const trayIconOff = path.join(appRootPath, 'app', 'images', `${platformTools.type}-tray-icon-off${platformTools.templateImageExtension(platformTools.type)}`)

/**
 * Tray images
 * @constant
 */
const trayMenuItemImageAppAutoUpdate = path.join(appRootPath, 'app', 'images', `tray-item-appAutoUpdate${platformTools.menuItemImageExtension}`)
const trayMenuItemImageAppLaunchOnStartup = path.join(appRootPath, 'app', 'images', `tray-item-appLaunchOnStartup${platformTools.menuItemImageExtension}`)


let on = () => {
    logger.debug('on')

    keyboard.enable().then(() => {
        global.trayMenu.setImageName('on')
        logger.debug('on')
    })
}

let off = () => {
    logger.debug('off')

    keyboard.disable().then(() => {
        global.trayMenu.setImageName('off')
        logger.debug('off')
    })
}

let toggle = () => {
    logger.debug('toggle')

    keyboard.isEnabled() ? off() :  on()
}

/**
 * Tray Menu Template
 * @returns {Electron.MenuItemConstructorOptions[]}
 */
let createTrayMenuTemplate = () => {
    return [
        {
            id: 'appProductName',
            label: `${appProductName}`,
            type: 'normal',
            enabled: false
        },
        {
            id: 'appCurrentVersion',
            label: `v${appCurrentVersion}`,
            type: 'normal',
            enabled: false
        },
        {
            type: 'separator'
        },
        {
            id: 'virtualKeyboardEnabled',
            label: 'Enable Virtual Keyboard',
            type: 'checkbox',
            checked: keyboard.isEnabledSync(),
            click(menuItem) {
                menuItem.checked ? on() :  off()
            }
        },
        {
            type: 'separator'
        },
        {
            id: 'appAutoUpdate',
            label: 'Automatic App Updates',
            icon: trayMenuItemImageAppAutoUpdate,
            type: 'checkbox',
            checked: configurationManager('appAutoUpdate').get(),
            click(menuItem) {
                configurationManager('appAutoUpdate').set(menuItem.checked)
            }
        },
        {
            id: 'appLaunchOnStartup',
            label: 'Launch on Startup',
            icon: trayMenuItemImageAppLaunchOnStartup,
            type: 'checkbox',
            checked: configurationManager('appLaunchOnStartup').get(),
            click(menuItem) {
                configurationManager('appLaunchOnStartup').set(menuItem.checked);
            }
        },
        {
            type: 'separator'
        },
        {
            label: `Quit ${appProductName}`,
            click() {
                app.quit()
            }
        }
    ]
}


/**
 * @class TrayMenu
 * @property {Electron.MenuItemConstructorOptions[]} template - Template
 * @property {Electron.Menu} menu - Menu
 * @property {String} imageName - Icon name
 * @extends EventEmitter
 */
class TrayMenu extends Tray {
    /**
     * @param {Electron.MenuItemConstructorOptions[]} template - Menu template
     * @constructor
     */
    constructor(template) {
        logger.debug('constructor')

        super(keyboard.isEnabled() ? trayIconOn : trayIconOff)

        this.template = template
        this.menu = Menu.buildFromTemplate(this.template)

        this.init()
    }

    /**
     * Init
     */
    init() {
        logger.debug('init')

        this.setContextMenu(this.menu)

        /**
         * @listens Electron.Tray#click
         */
        this.on('click', () => {
            logger.debug('TrayMenu#click')

            if (platformTools.isMacOS) { return }

            toggle()
        })

        /**
         * @listens Electron.Tray#click
         */
        this.on('doubleclick', () => {
            logger.debug('TrayMenu#doubleclick')

            toggle()
        })
    }

    /**
     * Set image name
     * @param {String} imageName - 'off', 'on'
     */
    setImageName(imageName) {
        logger.debug('setImageName')

        if (this.imageName === imageName) { return }

        this.imageName = imageName

        switch (this.imageName) {
            case 'on':
                this.setImage(trayIconOn)
                break
            case 'off':
                this.setImage(trayIconOff)
                break
        }
    }
}


/**
 * Init
 */
let init = () => {
    logger.debug('init')

    // Ensure single instance
    if (!global.trayMenu) {
        global.trayMenu = new TrayMenu(createTrayMenuTemplate())
    }
}


/**
 * @listens Electron.App#Event:ready
 */
app.once('ready', () => {
    logger.debug('app#ready')

    init()
})


/**
 * @exports
 */
module.exports = global.trayMenu
