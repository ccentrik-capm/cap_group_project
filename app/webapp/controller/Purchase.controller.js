sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/Button"
], function (Controller, MessageBox, MessageToast, Dialog, List, StandardListItem, Button) {
    "use strict";

    var BASE = "/po";

    function callOData(path, method, body) {
        var options = { method: method, headers: { "Content-Type": "application/json" } };
        if (body && method !== "GET") options.body = JSON.stringify(body);
        return fetch(BASE + path, options).then(function (response) {
            if (!response.ok) {
                return response.json().catch(function () { return {}; }).then(function (err) {
                    throw new Error((err.error && err.error.message) || "HTTP " + response.status);
                });
            }
            if (response.status === 204) return null;
            return response.json().then(function (json) {
                return json.value !== undefined ? json.value : json;
            });
        });
    }

    return Controller.extend("unified.controller.Purchase", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("purchase").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            var m = this.getView().getModel();
            if (!m) return;
            m.setProperty("/po_showOp", true);
            m.setProperty("/po_showCreate", false);
            m.setProperty("/po_showRead", false);
            m.setProperty("/po_showUpdate", false);
            m.setProperty("/po_showDetail", false);
            m.setProperty("/po_editItemMode", false);
            m.setProperty("/po_selectedPO", {});
            m.setProperty("/po_selectedPOItems", []);
            this._resetCreatePayload();
        },

        _resetCreatePayload: function () {
            this.getView().getModel().setProperty("/po_createPayload", {
                EBELN: "", BUKRS: "", BSART: "", LIFNR: "",
                AEDAT: new Date().toISOString().split("T")[0],
                ZTERM: "", currency: "",
                items: [{ EBELP: 10, MATNR: "", MENGE: null, MEINS: "", WERKS: "", NETPR: null }]
            });
        },

        onNavHome: function () {
            this.getOwnerComponent().getRouter().navTo("home");
        },

        // ── PANEL TOGGLE ─────────────────────────────────────────────
        onSelectCreate: function () { this._toggle("create"); },
        onSelectRead: function () {
            this._toggle("read");
            this.onLoadData();
        },
        onSelectUpdate: function () { this._toggle("update"); },

        _toggle: function (mode) {
            var m = this.getView().getModel();
            m.setProperty("/po_showOp",     false);
            m.setProperty("/po_showCreate", mode === "create");
            m.setProperty("/po_showRead",   mode === "read");
            m.setProperty("/po_showUpdate", mode === "update");
            m.setProperty("/po_showDetail", mode === "detail");
        },

        onBack: function () {
            var m = this.getView().getModel();
            m.setProperty("/po_showOp",      true);
            m.setProperty("/po_showCreate",  false);
            m.setProperty("/po_showRead",    false);
            m.setProperty("/po_showUpdate",  false);
            m.setProperty("/po_showDetail",  false);
            m.setProperty("/po_editItemMode", false);
            m.setProperty("/po_selectedPO",  {});
            m.setProperty("/po_selectedPOItems", []);
            this._resetCreatePayload();
        },

        onBackFromDetail: function () {
            var m = this.getView().getModel();
            m.setProperty("/po_showDetail", false);
            m.setProperty("/po_showRead", true);
        },

        // ── CREATE ───────────────────────────────────────────────────
        onSaveCombined: function () {
            var m = this.getView().getModel();
            var payload = m.getProperty("/po_createPayload");
            payload.items = (payload.items || []).filter(function (i) {
                return i.MATNR && i.MATNR.trim() !== "";
            });
            callOData("/PurchaseOrders", "POST", payload)
                .then(function () {
                    MessageBox.success("Purchase Order created successfully.");
                    this.onBack();
                }.bind(this))
                .catch(function (err) { MessageBox.error("Create failed: " + err.message); });
        },

        onAddItem: function () {
            var m = this.getView().getModel();
            var items = m.getProperty("/po_createPayload/items") || [];
            items.push({ EBELP: (items.length + 1) * 10, MATNR: "", MENGE: null, MEINS: "", WERKS: "", NETPR: null });
            m.setProperty("/po_createPayload/items", items);
        },

        // ── VENDOR F4 ────────────────────────────────────────────────
        onVendorF4Help: function () {
            var that = this;
            var vendors = this.getView().getModel().getProperty("/po_vendorList");
            var oList = new List({
                mode: "SingleSelectMaster",
                items: vendors.map(function (v) {
                    return new StandardListItem({ title: v.NAME, description: v.LIFNR });
                })
            });
            var oDialog = new Dialog({
                title: "Select Vendor",
                content: [oList],
                beginButton: new Button({ text: "Select", type: "Emphasized", press: function () {
                    var sel = oList.getSelectedItem();
                    if (!sel) { MessageBox.warning("Select a vendor"); return; }
                    var idx = oList.indexOfItem(sel);
                    that.getView().getModel().setProperty("/po_createPayload/LIFNR", vendors[idx].LIFNR);
                    oDialog.close(); oDialog.destroy();
                }}),
                endButton: new Button({ text: "Cancel", press: function () { oDialog.close(); oDialog.destroy(); } })
            });
            this.getView().addDependent(oDialog);
            oDialog.open();
        },

        // ── READ ─────────────────────────────────────────────────────
        onLoadData: function () {
            var m = this.getView().getModel();
            callOData("/PurchaseOrders", "GET", null)
                .then(function (data) { m.setProperty("/po_POHeader", data || []); })
                .catch(function (err) { MessageBox.error("Failed to load POs: " + err.message); });
        },

        onPORowSelect: function (oEvent) {
            var oRow = oEvent.getParameter("rowContext");
            if (!oRow) return;
            var m = this.getView().getModel();
            var oPO = oRow.getObject();
            m.setProperty("/po_selectedPO", oPO);
            callOData("/PurchaseOrderItems?$filter=up__ID eq '" + oPO.ID + "'", "GET", null)
                .then(function (data) { m.setProperty("/po_selectedPOItems", data || []); })
                .catch(function (err) { MessageBox.error("Failed to load items: " + err.message); });
            this._toggle("detail");
        },

        // ── INLINE ITEM UPDATE ───────────────────────────────────────
        onUpdateItemInline: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext();
            var oItem = oCtx.getObject();
            callOData("/PurchaseOrderItems(" + oItem.ID + ")", "PATCH", { MENGE: Number(oItem.MENGE) })
                .then(function () { MessageToast.show("Item " + oItem.EBELP + " updated."); })
                .catch(function (err) { MessageBox.error("Update failed: " + err.message); });
        },

        // ── DELETE PO ────────────────────────────────────────────────
        onDeletePO: function () {
            var m = this.getView().getModel();
            var oPO = m.getProperty("/po_selectedPO");
            MessageBox.confirm("Delete PO " + oPO.EBELN + "? This cannot be undone.", {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (sAction) {
                    if (sAction !== MessageBox.Action.YES) return;
                    callOData("/PurchaseOrders(" + oPO.ID + ")", "DELETE", null)
                        .then(function () {
                            MessageToast.show("PO " + oPO.EBELN + " deleted.");
                            this.onBack();
                            this.onLoadData();
                        }.bind(this))
                        .catch(function (err) { MessageBox.error("Delete failed: " + err.message); });
                }.bind(this)
            });
        },

        // ── UPDATE ITEM ──────────────────────────────────────────────
        onSearchItem: function () {
            var m = this.getView().getModel();
            var ebelp = m.getProperty("/po_searchItemId");
            if (!ebelp) { MessageBox.warning("Enter an Item Number"); return; }
            callOData("/PurchaseOrderItems(" + ebelp + ")", "GET", null)
                .then(function (data) {
                    m.setProperty("/po_editItemPayload", data);
                    m.setProperty("/po_editItemMode", true);
                })
                .catch(function () { MessageBox.error("Item not found"); });
        },

        onUpdateItem: function () {
            var m = this.getView().getModel();
            var data = m.getProperty("/po_editItemPayload");
            callOData("/PurchaseOrderItems(" + data.EBELP + ")", "PATCH", { MENGE: data.MENGE })
                .then(function () {
                    MessageToast.show("Item updated successfully.");
                    this.onBack();
                }.bind(this))
                .catch(function (err) { MessageBox.error("Update failed: " + err.message); });
        }
    });
});
