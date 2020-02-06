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
