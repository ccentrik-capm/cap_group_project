sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
    "use strict";

    var BASE = "/so-itemtable/So_Itemstables";

    return Controller.extend("unified.controller.SalesItem", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("salesitem").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            var m = this.getView().getModel();
            if (!m) return;
            m.setProperty("/si_showOp", true);
            m.setProperty("/si_showCreate", false);
            m.setProperty("/si_showRead", false);
            m.setProperty("/si_showUpdate", false);
            m.setProperty("/si_showDelete", false);
            m.setProperty("/si_showReadResult", false);
            m.setProperty("/si_showDeleteResult", false);
            m.setProperty("/si_editMode", false);
            m.setProperty("/si_createPayload", {});
            m.setProperty("/si_editPayload", {});
            m.setProperty("/si_salesItems", []);
            m.setProperty("/si_readVBELN", "");
            m.setProperty("/si_readPOSNR", "");
            m.setProperty("/si_searchVBELN", "");
            m.setProperty("/si_searchPOSNR", "");
            m.setProperty("/si_deleteVBELN", "");
            m.setProperty("/si_deletePOSNR", "");
        },

        _fetchCsrfToken: function () {
            return fetch("/so-itemtable/", {
                method: "GET", headers: { "X-CSRF-Token": "Fetch" }
            }).then(function (r) {
                return r.headers.get("X-CSRF-Token") || "";
            }).catch(function () { return ""; });
        },

        onNavHome: function () {
            this.getOwnerComponent().getRouter().navTo("home");
        },

        // ── PANEL TOGGLE ─────────────────────────────────────────────
        onCreate: function () {
            var m = this.getView().getModel();
            m.setProperty("/si_showOp", false); m.setProperty("/si_showCreate", true);
            m.setProperty("/si_showRead", false); m.setProperty("/si_showUpdate", false); m.setProperty("/si_showDelete", false);
            m.setProperty("/si_createPayload", { VBELN:"", POSNR:"", MATNR:"", MATKL:"", MENGE:"", MEINS:"", NETPR:"", PEINH:"" });
        },

        onRead: function () {
            var m = this.getView().getModel();
            m.setProperty("/si_showOp", false); m.setProperty("/si_showCreate", false);
            m.setProperty("/si_showRead", true); m.setProperty("/si_showUpdate", false); m.setProperty("/si_showDelete", false);
            m.setProperty("/si_readVBELN", ""); m.setProperty("/si_readPOSNR", "");
            fetch(BASE).then(function (r) { return r.json(); })
                .then(function (d) { m.setProperty("/si_salesItems", d.value || []); m.setProperty("/si_showReadResult", true); })
                .catch(function () { MessageBox.error("Unable to fetch data"); });
        },

        onUpdate: function () {
            var m = this.getView().getModel();
            m.setProperty("/si_showOp", false); m.setProperty("/si_showCreate", false);
            m.setProperty("/si_showRead", false); m.setProperty("/si_showUpdate", true); m.setProperty("/si_showDelete", false);
            m.setProperty("/si_editMode", false); m.setProperty("/si_searchVBELN", ""); m.setProperty("/si_searchPOSNR", "");
        },

        onDelete: function () {
            var m = this.getView().getModel();
            m.setProperty("/si_showOp", false); m.setProperty("/si_showCreate", false);
            m.setProperty("/si_showRead", false); m.setProperty("/si_showUpdate", false); m.setProperty("/si_showDelete", true);
            m.setProperty("/si_showDeleteResult", false); m.setProperty("/si_deleteVBELN", ""); m.setProperty("/si_deletePOSNR", "");
        },

        onBack: function () {
            var m = this.getView().getModel();
            m.setProperty("/si_showOp", true); m.setProperty("/si_showCreate", false);
            m.setProperty("/si_showRead", false); m.setProperty("/si_showUpdate", false); m.setProperty("/si_showDelete", false);
            m.setProperty("/si_showReadResult", false); m.setProperty("/si_showDeleteResult", false); m.setProperty("/si_editMode", false);
        },

        // ── CREATE ───────────────────────────────────────────────────
        onSave: function () {
            var m = this.getView().getModel();
            var p = m.getProperty("/si_createPayload");
            if (!p.VBELN || !p.VBELN.trim()) { MessageBox.warning("VBELN required"); return; }
            if (!p.POSNR || !p.POSNR.trim()) { MessageBox.warning("POSNR required"); return; }
            if (!p.MATNR || !p.MATNR.trim()) { MessageBox.warning("MATNR required"); return; }
            var body = { VBELN: p.VBELN.trim(), POSNR: p.POSNR.trim(), MATNR: p.MATNR.trim(), MATKL: p.MATKL || "", MEINS: p.MEINS || "", PEINH: p.PEINH || "" };
            if (p.MENGE) body.MENGE = parseFloat(p.MENGE);
            if (p.NETPR) body.NETPR = parseFloat(p.NETPR);
            this._fetchCsrfToken().then(function (token) {
                return fetch(BASE, { method: "POST", headers: { "Content-Type": "application/json", "X-CSRF-Token": token }, body: JSON.stringify(body) });
            }).then(function (r) {
                if (r.ok || r.status === 201) {
                    MessageToast.show("Sales Item Created Successfully");
                    m.setProperty("/si_createPayload", { VBELN:"", POSNR:"", MATNR:"", MATKL:"", MENGE:"", MEINS:"", NETPR:"", PEINH:"" });
                } else { MessageBox.error("Creation Failed"); }
            }).catch(function () { MessageBox.error("Network Error"); });
        },

        // ── READ SEARCH ──────────────────────────────────────────────
        onSearchItem: function () {
            var m = this.getView().getModel();
            var v = m.getProperty("/si_readVBELN"), p = m.getProperty("/si_readPOSNR"), filters = [];
            if (v && v.trim()) filters.push("contains(VBELN,'" + v.trim() + "')");
            if (p && p.trim()) filters.push("contains(POSNR,'" + p.trim() + "')");
            var url = filters.length ? BASE + "?$filter=" + filters.join(" and ") : BASE;
            fetch(url).then(function (r) { return r.json(); })
                .then(function (d) { m.setProperty("/si_salesItems", d.value || []); m.setProperty("/si_showReadResult", true); })
                .catch(function () { MessageBox.error("Search failed"); });
        },

        // ── UPDATE LOAD ──────────────────────────────────────────────
        onEditItem: function () {
            var m = this.getView().getModel();
            var v = m.getProperty("/si_searchVBELN"), p = m.getProperty("/si_searchPOSNR");
            if (!v || !v.trim()) { MessageBox.warning("Enter VBELN"); return; }
            if (!p || !p.trim()) { MessageBox.warning("Enter POSNR"); return; }
            fetch(BASE + "(VBELN='" + v.trim() + "',POSNR='" + p.trim() + "')")
                .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
                .then(function (d) { m.setProperty("/si_editPayload", d); m.setProperty("/si_editMode", true); })
                .catch(function () {
                    var f = ["contains(VBELN,'" + v.trim() + "')"];
                    if (p) f.push("contains(POSNR,'" + p.trim() + "')");
                    fetch(BASE + "?$filter=" + f.join(" and ")).then(function (r) { return r.json(); })
                        .then(function (d) {
                            if (d.value && d.value.length > 0) { m.setProperty("/si_editPayload", d.value[0]); m.setProperty("/si_editMode", true); }
                            else { MessageBox.warning("Item not found"); }
                        });
                });
        },

        // ── UPDATE SAVE ──────────────────────────────────────────────
        onUpdateItem: function () {
            var m = this.getView().getModel();
            var p = m.getProperty("/si_editPayload");
            if (!p.VBELN || !p.POSNR) { MessageBox.warning("Key fields missing"); return; }
            var body = { MATKL: p.MATKL || "", MEINS: p.MEINS || "", PEINH: p.PEINH || "" };
            if (p.MENGE !== undefined && p.MENGE !== "") body.MENGE = parseFloat(p.MENGE);
            if (p.NETPR !== undefined && p.NETPR !== "") body.NETPR = parseFloat(p.NETPR);
            var url = BASE + "(VBELN='" + p.VBELN + "',POSNR='" + p.POSNR + "')";
            this._fetchCsrfToken().then(function (token) {
                return fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json", "X-CSRF-Token": token }, body: JSON.stringify(body) });
            }).then(function (r) {
                if (r.ok || r.status === 204) { MessageToast.show("Item Updated"); m.setProperty("/si_editMode", false); }
                else { MessageBox.error("Update Failed"); }
            }).catch(function () { MessageBox.error("Network Error"); });
        },

        onCancelEdit: function () {
            this.getView().getModel().setProperty("/si_editMode", false);
        },

        // ── DELETE SEARCH ─────────────────────────────────────────────
        onDeleteSearch: function () {
            var m = this.getView().getModel();
            var v = m.getProperty("/si_deleteVBELN"), p = m.getProperty("/si_deletePOSNR"), filters = [];
            if (v && v.trim()) filters.push("contains(VBELN,'" + v.trim() + "')");
            if (p && p.trim()) filters.push("contains(POSNR,'" + p.trim() + "')");
            var url = filters.length ? BASE + "?$filter=" + filters.join(" and ") : BASE;
            fetch(url).then(function (r) { return r.json(); })
                .then(function (d) { m.setProperty("/si_salesItems", d.value || []); m.setProperty("/si_showDeleteResult", true); })
                .catch(function () { MessageBox.error("Search failed"); });
        },

        // ── DELETE ───────────────────────────────────────────────────
        onDeleteSelected: function () {
            var table = this.byId("siDeleteTable");
            var indices = table.getSelectedIndices();
            if (!indices.length) { MessageBox.warning("Select rows first"); return; }
            var model = this.getView().getModel();
            var rows = model.getProperty("/si_salesItems");
            MessageBox.confirm("Delete selected Items?", {
                onClose: function (action) {
                    if (action === MessageBox.Action.OK) {
                        this._fetchCsrfToken().then(function (token) {
                            return Promise.all(indices.map(function (i) {
                                return fetch(BASE + "(VBELN='" + rows[i].VBELN + "',POSNR='" + rows[i].POSNR + "')", {
                                    method: "DELETE", headers: { "X-CSRF-Token": token }
                                });
                            }));
                        }).then(function () {
                            MessageToast.show("Items Deleted");
                            model.setProperty("/si_showDeleteResult", false);
                            model.setProperty("/si_salesItems", []);
                        }).catch(function () { MessageBox.error("Delete failed"); });
                    }
                }.bind(this)
            });
        }
    });
});
