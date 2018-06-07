'use strict';


/**
 * Modules
 * Node
 * @constant
 */
const fs = require('fs-extra');
const path = require('path');

/**
 * Modules
 * Electron
 * @constant
 */
const electron = require('electron');
const { remote, BrowserWindow } = electron;
const app = electron.app ? electron.app : remote.app;

/**
 * Modules
 * External
 * @constant
 */
const keyboard = require('macos-accessibility-keyboard')

/**
 * Modules
 * Internal
 * @constant
 */
const logger = require('@sidneys/logger')({ write: true });

/**
 * Disable Keyboard
 * @return {Promise} A promise.
 */
let toggle = () => {
    logger.debug('toggle')

    keyboard.toggle().then(() => {
        if (keyboard.isEnabled()) {
            toggleKeyboard()
        }
    })
}


/**
 * @exports
 */
module.exports = {
    isEnabled: isEnabled,
    isEnabledSync: isEnabledSync,
    enable: enableKeyboard,
    disable: disableKeyboard,
    toggle: toggle
}
