/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

'use strict';

const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const IN_SYNC_ICON = "process-completed-symbolic";
const OUT_OF_SYNC_ICON = "dialog-error-symbolic";
const INIT_ICON = "process-working-symbolic";

const REPOSITORY_PATH = "/absolute/path/to/repository";
const INTERVAL = 3000;

const Me = ExtensionUtils.getCurrentExtension();

var GitIndicator = class GitIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, Me.metadata.uuid, false);

        this.icon = new St.Icon({
            icon_name: INIT_ICON,
            style_class: 'system-status-icon'
        });
        this.actor.add_child(this.icon);

        GLib.timeout_add(GLib.G_PRIORITY_DEFAULT, INTERVAL, this.update);
    }

    update() {
        let [res, out] = GLib.spawn_command_line_sync("git --git-dir=" + REPOSITORY_PATH + "/.git --work-tree=" + REPOSITORY_PATH + " status -s");
        Main.panel.statusArea[Me.metadata.uuid].icon.icon_name = out.length ? OUT_OF_SYNC_ICON : IN_SYNC_ICON;
        return true;
    }
}

GitIndicator = GObject.registerClass(
    { GTypeName: 'GitIndicator' },
    GitIndicator
);

class Extension {
    constructor() {

    }

    enable() {
        Main.panel.addToStatusArea(Me.metadata.uuid, new GitIndicator());
    }

    disable() {
        Main.panel.statusArea[Me.metadata.uuid].destroy();
    }
}

function init() {
    return new Extension();
}
