sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
    "use strict";

    var BASE = "/odata/v4/sales-order/ZSO_VBAK";

    return Controller.extend("unified.controller.SalesOrder", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("salesorder").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            var m = this.getView().getModel();
            if (!m) return;
            m.setProperty("/so_showOp", true);
            m.setProperty("/so_showCreate", false);
            m.setProperty("/so_showRead", false);
            m.setProperty("/so_showUpdate", false);
            m.setProperty("/so_showDelete", false);
            m.setProperty("/so_showReadResult", false);
            m.setProperty("/so_showDeleteResult", false);
            m.setProperty("/so_editMode", false);
            m.setProperty("/so_createPayload", {});
            m.setProperty("/so_editPayload", {});
            m.setProperty("/so_salesOrders", []);
            m.setProperty("/so_readVBELN", "");
            m.setProperty("/so_searchVBELN", "");
            m.setProperty("/so_deleteVBELN", "");
        },

        _fetchCsrfToken: function () {
            return fetch("/odata/v4/sales-order/", {
                method: "GET",
                headers: { "X-CSRF-Token": "Fetch" }
            }).then(function (r) {
                return r.headers.get("X-CSRF-Token") || "";
            }).catch(function () { return ""; });
        },

        onNavHome: function () {
            this.getOwnerComponent().getRouter().navTo("home");
        },

        // ── PANEL TOGGLE ────────────────────────────────────────────
        onCreate: function () {
            var m = this.getView().getModel();
            m.setProperty("/so_showOp", false);
            m.setProperty("/so_showCreate", true);
            m.setProperty("/so_showRead", false);
            m.setProperty("/so_showUpdate", false);
            m.setProperty("/so_showDelete", false);
            m.setProperty("/so_createPayload", { VBELN: "", ERDAT: "", KUNNR: "", ERNAM: "" });
        },

        onRead: function () {
            var m = this.getView().getModel();
            m.setProperty("/so_showOp", false);
            m.setProperty("/so_showCreate", false);
            m.setProperty("/so_showRead", true);
            m.setProperty("/so_showUpdate", false);
            m.setProperty("/so_showDelete", false);
            m.setProperty("/so_readVBELN", "");
            fetch(BASE).then(function (r) { return r.json(); })
                .then(function (data) {
                    m.setProperty("/so_salesOrders", data.value || []);
                    m.setProperty("/so_showReadResult", true);
                }).catch(function () { MessageBox.error("Unable to fetch data"); });
        },

        onUpdate: function () {
            var m = this.getView().getModel();
            m.setProperty("/so_showOp", false);
            m.setProperty("/so_showCreate", false);
            m.setProperty("/so_showRead", false);
            m.setProperty("/so_showUpdate", true);
            m.setProperty("/so_showDelete", false);
            m.setProperty("/so_editMode", false);
            m.setProperty("/so_searchVBELN", "");
        },

        onDelete: function () {
            var m = this.getView().getModel();
            m.setProperty("/so_showOp", false);
            m.setProperty("/so_showCreate", false);
            m.setProperty("/so_showRead", false);
            m.setProperty("/so_showUpdate", false);
            m.setProperty("/so_showDelete", true);
            m.setProperty("/so_showDeleteResult", false);
            m.setProperty("/so_deleteVBELN", "");
        },

        onBack: function () {
            var m = this.getView().getModel();
            m.setProperty("/so_showOp", true);
            m.setProperty("/so_showCreate", false);
            m.setProperty("/so_showRead", false);
            m.setProperty("/so_showUpdate", false);
            m.setProperty("/so_showDelete", false);
            m.setProperty("/so_showReadResult", false);
            m.setProperty("/so_showDeleteResult", false);
            m.setProperty("/so_editMode", false);
        },

        // ── CREATE ───────────────────────────────────────────────────
        onSave: function () {
            var m = this.getView().getModel();
            var p = m.getProperty("/so_createPayload");
            if (!p.VBELN || !p.VBELN.trim()) { MessageBox.warning("VBELN required"); return; }
            var body = { VBELN: p.VBELN.trim(), KUNNR: p.KUNNR || "", ERNAM: p.ERNAM || "" };
            if (p.ERDAT && p.ERDAT.trim()) body.ERDAT = p.ERDAT.trim();
            this._fetchCsrfToken().then(function (token) {
                return fetch(BASE, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
                    body: JSON.stringify(body)
                });
            }).then(function (r) {
                if (r.ok || r.status === 201) {
                    MessageToast.show("Sales Order Created Successfully");
                    m.setProperty("/so_createPayload", { VBELN: "", ERDAT: "", KUNNR: "", ERNAM: "" });
                } else { return r.json().then(function (e) { MessageBox.error((e.error && e.error.message) || "Creation Failed"); }); }
            }).catch(function () { MessageBox.error("Network Error"); });
        },

        // ── READ SEARCH ──────────────────────────────────────────────
        onSearchSalesOrder: function () {
            var m = this.getView().getModel();
            var id = m.getProperty("/so_readVBELN");
            var url = id && id.trim() ? BASE + "?$filter=contains(VBELN,'" + id.trim() + "')" : BASE;
            fetch(url).then(function (r) { return r.json(); })
                .then(function (data) {
                    m.setProperty("/so_salesOrders", data.value || []);
                    m.setProperty("/so_showReadResult", true);
                }).catch(function () { MessageBox.error("Search failed"); });
        },

        // ── UPDATE LOAD ──────────────────────────────────────────────
        onEditSalesOrder: function () {
            var m = this.getView().getModel();
            var vbeln = m.getProperty("/so_searchVBELN");
            if (!vbeln || !vbeln.trim()) { MessageBox.warning("Enter VBELN"); return; }
            fetch(BASE + "?$filter=contains(VBELN,'" + vbeln.trim() + "')")
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (data.value && data.value.length > 0) {
                        m.setProperty("/so_editPayload", data.value[0]);
                        m.setProperty("/so_editMode", true);
                    } else { MessageBox.warning("Sales Order not found"); }
                }).catch(function () { MessageBox.error("Error fetching record"); });
        },

        // ── UPDATE SAVE ──────────────────────────────────────────────
        onUpdateSalesOrder: function () {
            var m = this.getView().getModel();
            var p = m.getProperty("/so_editPayload");
            if (!p.VBELN) { MessageBox.warning("VBELN missing"); return; }
            var body = { KUNNR: p.KUNNR || "", ERNAM: p.ERNAM || "" };
            if (p.ERDAT) body.ERDAT = p.ERDAT;
            this._fetchCsrfToken().then(function (token) {
                return fetch(BASE + "('" + p.VBELN + "')", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
                    body: JSON.stringify(body)
                });
            }).then(function (r) {
                if (r.ok || r.status === 204) {
                    MessageToast.show("Sales Order Updated Successfully");
                    m.setProperty("/so_editMode", false);
                    m.setProperty("/so_searchVBELN", "");
                } else { MessageBox.error("Update Failed"); }
            }).catch(function () { MessageBox.error("Network Error"); });
        },

        onCancelEdit: function () {
            this.getView().getModel().setProperty("/so_editMode", false);
        },

        // ── DELETE SEARCH ─────────────────────────────────────────────
        onDeleteSearch: function () {
            var m = this.getView().getModel();
            var id = m.getProperty("/so_deleteVBELN");
            var url = id && id.trim() ? BASE + "?$filter=contains(VBELN,'" + id.trim() + "')" : BASE;
            fetch(url).then(function (r) { return r.json(); })
                .then(function (data) {
                    m.setProperty("/so_salesOrders", data.value || []);
                    m.setProperty("/so_showDeleteResult", true);
                }).catch(function () { MessageBox.error("Search failed"); });
        },

        // ── DELETE ───────────────────────────────────────────────────
        onDeleteSelected: function () {
            var table = this.byId("soDeleteTable");
            var indices = table.getSelectedIndices();
            if (!indices.length) { MessageBox.warning("Select rows first"); return; }
            var model = this.getView().getModel();
            var rows = model.getProperty("/so_salesOrders");
            MessageBox.confirm("Delete selected Sales Orders?", {
                onClose: function (action) {
                    if (action === MessageBox.Action.OK) {
                        this._fetchCsrfToken().then(function (token) {
                            return Promise.all(indices.map(function (i) {
                                return fetch(BASE + "('" + rows[i].VBELN + "')", {
                                    method: "DELETE", headers: { "X-CSRF-Token": token }
                                });
                            }));
                        }).then(function () {
                            MessageToast.show("Deleted Successfully");
                            model.setProperty("/so_showDeleteResult", false);
                            model.setProperty("/so_salesOrders", []);
                            model.setProperty("/so_deleteVBELN", "");
                        }).catch(function () { MessageBox.error("Delete failed"); });
                    }
                }.bind(this)
            });
        }
    });
});
