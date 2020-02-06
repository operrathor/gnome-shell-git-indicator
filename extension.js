'use strict';

const ByteArray = imports.byteArray;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const IN_SYNC_ICON = 'process-completed-symbolic';
const OUT_OF_SYNC_ICON = 'dialog-error-symbolic';
const INIT_ICON = 'process-working-symbolic';
const UPDATE_INTERVAL = 3000;

const Me = ExtensionUtils.getCurrentExtension();

let GitIndicator = class GitIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, Me.metadata.uuid, false);

        this.update = this.update.bind(this);

        this.icon = new St.Icon({
            icon_name: INIT_ICON,
            style_class: 'system-status-icon'
        });
        this.actor.add_child(this.icon);

        const repositoriesFile = Gio.File.new_for_path(GLib.build_filenamev([Me.path + '/', 'repositories.json']));
        const [success, contents] = repositoriesFile.load_contents(null);
        this.repositories = contents.toString() ? JSON.parse(ByteArray.toString(contents)) : {};

        this.menuItems = [];
        for (let i = 0; i < this.repositories.length; i++) {
            const menuItemName = this.repositories[i].name ? this.repositories[i].name : this.repositories[i].path;
            const menuItem = new PopupMenu.PopupImageMenuItem(menuItemName, INIT_ICON);
            this.menu.addMenuItem(menuItem);
            this.menuItems.push(menuItem);
        }

        GLib.timeout_add(GLib.G_PRIORITY_DEFAULT, UPDATE_INTERVAL, this.update);
    }

    update() {
        let warning = false;
        for (let i = 0; i < this.repositories.length; i++) {
            const cmd = 'git --git-dir=' + this.repositories[i].path + '/.git --work-tree=' + this.repositories[i].path + ' status -s';
            const [res, out] = GLib.spawn_command_line_sync(cmd);
            if (out.length) {
                this.menuItems[i].setIcon(OUT_OF_SYNC_ICON);
                if (!this.repositories[i].noWarning) {
                    warning = true;
                }
            }
            else {
                this.menuItems[i].setIcon(IN_SYNC_ICON);
            }
        }
        this.icon.icon_name = warning ? OUT_OF_SYNC_ICON : IN_SYNC_ICON;
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
