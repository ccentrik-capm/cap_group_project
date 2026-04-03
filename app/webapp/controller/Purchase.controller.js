// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/m/MessageBox",
//     "sap/m/MessageToast",
//     "sap/m/Dialog",
//     "sap/m/List",
//     "sap/m/StandardListItem",
//     "sap/m/Button"
// ], function (Controller, MessageBox, MessageToast, Dialog, List, StandardListItem, Button) {
//     "use strict";

//     var BASE = "/po-table/po_headertable";
//     var BASE = "/po-item/po_itemtable";

//     function callOData(path, method, body) {
//         var options = { method: method, headers: { "Content-Type": "application/json" } };
//         if (body && method !== "GET") options.body = JSON.stringify(body);
//         return fetch(BASE + path, options).then(function (response) {
//             if (!response.ok) {
//                 return response.json().catch(function () { return {}; }).then(function (err) {
//                     throw new Error((err.error && err.error.message) || "HTTP " + response.status);
//                 });
//             }
//             if (response.status === 204) return null;
//             return response.json().then(function (json) {
//                 return json.value !== undefined ? json.value : json;
//             });
//         });
//     }

//     return Controller.extend("unified.controller.Purchase", {

//         onInit: function () {
//             var oRouter = this.getOwnerComponent().getRouter();
//             oRouter.getRoute("purchase").attachPatternMatched(this._onRouteMatched, this);
//         },

//         _onRouteMatched: function () {
//             var m = this.getView().getModel();
//             if (!m) return;
//             m.setProperty("/po_showOp", true);
//             m.setProperty("/po_showCreate", false);
//             m.setProperty("/po_showRead", false);
//             m.setProperty("/po_showUpdate", false);
//             m.setProperty("/po_showDetail", false);
//             m.setProperty("/po_editItemMode", false);
//             m.setProperty("/po_selectedPO", {});
//             m.setProperty("/po_selectedPOItems", []);
//             this._resetCreatePayload();
//         },

//         _resetCreatePayload: function () {
//             this.getView().getModel().setProperty("/po_createPayload", {
//                 EBELN: "", BUKRS: "", BSART: "", LIFNR: "",
//                 AEDAT: new Date().toISOString().split("T")[0],
//                 ZTERM: "", currency: "",
//                 items: [{ EBELP: 10, MATNR: "", MENGE: null, MEINS: "", WERKS: "", NETPR: null }]
//             });
//         },

//         onNavHome: function () {
//             this.getOwnerComponent().getRouter().navTo("home");
//         },

//         // ── PANEL TOGGLE ─────────────────────────────────────────────
//         onSelectCreate: function () { this._toggle("create"); },
//         onSelectRead: function () {
//             this._toggle("read");
//             this.onLoadData();
//         },
//         onSelectUpdate: function () { this._toggle("update"); },

//         _toggle: function (mode) {
//             var m = this.getView().getModel();
//             m.setProperty("/po_showOp",     false);
//             m.setProperty("/po_showCreate", mode === "create");
//             m.setProperty("/po_showRead",   mode === "read");
//             m.setProperty("/po_showUpdate", mode === "update");
//             m.setProperty("/po_showDetail", mode === "detail");
//         },

//         onBack: function () {
//             var m = this.getView().getModel();
//             m.setProperty("/po_showOp",      true);
//             m.setProperty("/po_showCreate",  false);
//             m.setProperty("/po_showRead",    false);
//             m.setProperty("/po_showUpdate",  false);
//             m.setProperty("/po_showDetail",  false);
//             m.setProperty("/po_editItemMode", false);
//             m.setProperty("/po_selectedPO",  {});
//             m.setProperty("/po_selectedPOItems", []);
//             this._resetCreatePayload();
//         },

//         onBackFromDetail: function () {
//             var m = this.getView().getModel();
//             m.setProperty("/po_showDetail", false);
//             m.setProperty("/po_showRead", true);
//         },

//         // ── CREATE ───────────────────────────────────────────────────
//         onSaveCombined: function () {
//             var m = this.getView().getModel();
//             var payload = m.getProperty("/po_createPayload");
//             payload.items = (payload.items || []).filter(function (i) {
//                 return i.MATNR && i.MATNR.trim() !== "";
//             });
//             callOData("/PurchaseOrders", "POST", payload)
//                 .then(function () {
//                     MessageBox.success("Purchase Order created successfully.");
//                     this.onBack();
//                 }.bind(this))
//                 .catch(function (err) { MessageBox.error("Create failed: " + err.message); });
//         },

//         onAddItem: function () {
//             var m = this.getView().getModel();
//             var items = m.getProperty("/po_createPayload/items") || [];
//             items.push({ EBELP: (items.length + 1) * 10, MATNR: "", MENGE: null, MEINS: "", WERKS: "", NETPR: null });
//             m.setProperty("/po_createPayload/items", items);
//         },

//         // ── VENDOR F4 ────────────────────────────────────────────────
//         onVendorF4Help: function () {
//             var that = this;
//             var vendors = this.getView().getModel().getProperty("/po_vendorList");
//             var oList = new List({
//                 mode: "SingleSelectMaster",
//                 items: vendors.map(function (v) {
//                     return new StandardListItem({ title: v.NAME, description: v.LIFNR });
//                 })
//             });
//             var oDialog = new Dialog({
//                 title: "Select Vendor",
//                 content: [oList],
//                 beginButton: new Button({ text: "Select", type: "Emphasized", press: function () {
//                     var sel = oList.getSelectedItem();
//                     if (!sel) { MessageBox.warning("Select a vendor"); return; }
//                     var idx = oList.indexOfItem(sel);
//                     that.getView().getModel().setProperty("/po_createPayload/LIFNR", vendors[idx].LIFNR);
//                     oDialog.close(); oDialog.destroy();
//                 }}),
//                 endButton: new Button({ text: "Cancel", press: function () { oDialog.close(); oDialog.destroy(); } })
//             });
//             this.getView().addDependent(oDialog);
//             oDialog.open();
//         },

//         // ── READ ─────────────────────────────────────────────────────
//         onLoadData: function () {
//             var m = this.getView().getModel();
//             callOData("/PurchaseOrders", "GET", null)
//                 .then(function (data) { m.setProperty("/po_POHeader", data || []); })
//                 .catch(function (err) { MessageBox.error("Failed to load POs: " + err.message); });
//         },

//         onPORowSelect: function (oEvent) {
//             var oRow = oEvent.getParameter("rowContext");
//             if (!oRow) return;
//             var m = this.getView().getModel();
//             var oPO = oRow.getObject();
//             m.setProperty("/po_selectedPO", oPO);
//             callOData("/PurchaseOrderItems?$filter=up__ID eq '" + oPO.ID + "'", "GET", null)
//                 .then(function (data) { m.setProperty("/po_selectedPOItems", data || []); })
//                 .catch(function (err) { MessageBox.error("Failed to load items: " + err.message); });
//             this._toggle("detail");
//         },

//         // ── INLINE ITEM UPDATE ───────────────────────────────────────
//         onUpdateItemInline: function (oEvent) {
//             var oCtx = oEvent.getSource().getBindingContext();
//             var oItem = oCtx.getObject();
//             callOData("/PurchaseOrderItems(" + oItem.ID + ")", "PATCH", { MENGE: Number(oItem.MENGE) })
//                 .then(function () { MessageToast.show("Item " + oItem.EBELP + " updated."); })
//                 .catch(function (err) { MessageBox.error("Update failed: " + err.message); });
//         },

//         // ── DELETE PO ────────────────────────────────────────────────
//         onDeletePO: function () {
//             var m = this.getView().getModel();
//             var oPO = m.getProperty("/po_selectedPO");
//             MessageBox.confirm("Delete PO " + oPO.EBELN + "? This cannot be undone.", {
//                 actions: [MessageBox.Action.YES, MessageBox.Action.NO],
//                 onClose: function (sAction) {
//                     if (sAction !== MessageBox.Action.YES) return;
//                     callOData("/PurchaseOrders(" + oPO.ID + ")", "DELETE", null)
//                         .then(function () {
//                             MessageToast.show("PO " + oPO.EBELN + " deleted.");
//                             this.onBack();
//                             this.onLoadData();
//                         }.bind(this))
//                         .catch(function (err) { MessageBox.error("Delete failed: " + err.message); });
//                 }.bind(this)
//             });
//         },

//         // ── UPDATE ITEM ──────────────────────────────────────────────
//         onSearchItem: function () {
//             var m = this.getView().getModel();
//             var ebelp = m.getProperty("/po_searchItemId");
//             if (!ebelp) { MessageBox.warning("Enter an Item Number"); return; }
//             callOData("/PurchaseOrderItems(" + ebelp + ")", "GET", null)
//                 .then(function (data) {
//                     m.setProperty("/po_editItemPayload", data);
//                     m.setProperty("/po_editItemMode", true);
//                 })
//                 .catch(function () { MessageBox.error("Item not found"); });
//         },

//         onUpdateItem: function () {
//             var m = this.getView().getModel();
//             var data = m.getProperty("/po_editItemPayload");
//             callOData("/PurchaseOrderItems(" + data.EBELP + ")", "PATCH", { MENGE: data.MENGE })
//                 .then(function () {
//                     MessageToast.show("Item updated successfully.");
//                     this.onBack();
//                 }.bind(this))
//                 .catch(function (err) { MessageBox.error("Update failed: " + err.message); });
//         }
//     });
// });

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

    // ── Correct URLs from cds watch output ──────────────────────────
    // PurchaseOrder header  → /odata/v4/po-table/po_headertable   (key = ID, UUID from cuid)
    // PurchaseOrderItem     → /odata/v4/po-item/po_itemtable       (key = ID, UUID from cuid)
    var PO_BASE  = "/po-table/po_headertable";
    var POI_BASE = "/po-item/po_itemtable";

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
            m.setProperty("/po_POHeader", []);
            m.setProperty("/po_updateItems", []);
            m.setProperty("/po_searchEBELN", "");
            this._resetCreatePayload();
        },

        _resetCreatePayload: function () {
            this.getView().getModel().setProperty("/po_createPayload", {
                EBELN: "", BUKRS: "", BSART: "", LIFNR: "",
                AEDAT: new Date().toISOString().split("T")[0],
                ZTERM: "", currency: "",
                items: [
                    { EBELP: 10, MATNR: "", MENGE: null, MEINS: "", WERKS: "", NETPR: null }
                ]
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
            m.setProperty("/po_updateItems", []);
            m.setProperty("/po_searchEBELN", "");
            this._resetCreatePayload();
        },

        onBackFromDetail: function () {
            var m = this.getView().getModel();
            m.setProperty("/po_showDetail", false);
            m.setProperty("/po_showRead", true);
        },

        // ── VENDOR F4 HELP ───────────────────────────────────────────
        onVendorF4Help: function () {
            var that = this;
            var vendors = this.getView().getModel().getProperty("/po_vendorList") || [];
            var oList = new List({
                mode: "SingleSelectMaster",
                items: vendors.map(function (v) {
                    return new StandardListItem({ title: v.NAME, description: v.LIFNR });
                })
            });
            var oDialog = new Dialog({
                title: "Select Vendor",
                content: [oList],
                beginButton: new Button({
                    text: "Select", type: "Emphasized",
                    press: function () {
                        var sel = oList.getSelectedItem();
                        if (!sel) { MessageBox.warning("Please select a vendor"); return; }
                        var idx = oList.indexOfItem(sel);
                        that.getView().getModel().setProperty("/po_createPayload/LIFNR", vendors[idx].LIFNR);
                        oDialog.close(); oDialog.destroy();
                    }
                }),
                endButton: new Button({
                    text: "Cancel",
                    press: function () { oDialog.close(); oDialog.destroy(); }
                })
            });
            this.getView().addDependent(oDialog);
            oDialog.open();
        },

        // ── ADD ITEM ROW ──────────────────────────────────────────────
        onAddItem: function () {
            var m = this.getView().getModel();
            var items = m.getProperty("/po_createPayload/items") || [];
            items.push({
                EBELP: (items.length + 1) * 10,
                MATNR: "", MENGE: null, MEINS: "", WERKS: "", NETPR: null
            });
            m.setProperty("/po_createPayload/items", items);
        },

        // ── CREATE PO ────────────────────────────────────────────────
        // PurchaseOrder uses cuid (UUID) as key — generated by CAP automatically.
        // We create header first, then create each item with up__ID pointing to header.
        onSaveCombined: function () {
            var m = this.getView().getModel();
            var p = m.getProperty("/po_createPayload");

            if (!p.EBELN || !p.EBELN.trim()) {
                MessageBox.warning("PO Number (EBELN) is required");
                return;
            }
            if (!p.LIFNR || !p.LIFNR.trim()) {
                MessageBox.warning("Vendor (LIFNR) is required");
                return;
            }

            // Step 1: Create PO Header
            var headerBody = {
                EBELN: p.EBELN.trim(),
                BUKRS: p.BUKRS || "",
                BSART: p.BSART || "",
                LIFNR: p.LIFNR.trim(),
                AEDAT: p.AEDAT || null,
                ZTERM: p.ZTERM || "",
                currency: p.currency || ""
            };

            fetch(PO_BASE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(headerBody)
            })
            .then(function (r) {
                if (!r.ok) { return r.json().then(function(e){ throw new Error((e.error&&e.error.message)||"Header creation failed: "+r.status); }); }
                return r.json();
            })
            .then(function (created) {
                // Step 2: Create each valid line item linked to the new PO header ID
                var headerId = created.ID;
                var validItems = (p.items || []).filter(function (i) {
                    return i.MATNR && i.MATNR.trim() !== "";
                });

                if (validItems.length === 0) {
                    MessageToast.show("PO Header created (no items added)");
                    this.onBack();
                    return;
                }

                return Promise.all(validItems.map(function (item) {
                    var itemBody = {
                        up__ID: headerId,
                        EBELP: item.EBELP || 10,
                        MATNR: item.MATNR.trim(),
                        MENGE: item.MENGE ? parseFloat(item.MENGE) : null,
                        MEINS: item.MEINS || "",
                        WERKS: item.WERKS || "",
                        NETPR: item.NETPR ? parseFloat(item.NETPR) : null
                    };
                    return fetch(POI_BASE, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(itemBody)
                    });
                }));
            }.bind(this))
            .then(function () {
                MessageBox.success("Purchase Order created successfully!");
                this.onBack();
            }.bind(this))
            .catch(function (e) {
                MessageBox.error("Create failed: " + e.message);
            });
        },

        // ── READ / LOAD POs ──────────────────────────────────────────
        onLoadData: function () {
            var m = this.getView().getModel();
            fetch(PO_BASE)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    m.setProperty("/po_POHeader", data.value || []);
                })
                .catch(function (e) { MessageBox.error("Failed to load POs: " + e.message); });
        },

        // ── ROW SELECT → DETAIL ──────────────────────────────────────
        onPORowSelect: function (oEvent) {
            var oRow = oEvent.getParameter("rowContext");
            if (!oRow) return;
            var m = this.getView().getModel();
            var oPO = oRow.getObject();
            m.setProperty("/po_selectedPO", oPO);

            // Load items for this PO using up__ID (the UUID of the parent PO)
            fetch(POI_BASE + "?$filter=up__ID eq '" + oPO.ID + "'")
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    m.setProperty("/po_selectedPOItems", data.value || []);
                })
                .catch(function (e) { MessageBox.error("Failed to load items: " + e.message); });

            this._toggle("detail");
        },

        // ── INLINE ITEM UPDATE (from detail panel) ────────────────────
        onUpdateItemInline: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext();
            var oItem = oCtx.getObject();

            fetch(POI_BASE + "(" + oItem.ID + ")", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ MENGE: parseFloat(oItem.MENGE) })
            })
            .then(function (r) {
                if (r.ok || r.status === 204) {
                    MessageToast.show("Item " + oItem.EBELP + " quantity updated");
                } else {
                    MessageBox.error("Update failed: " + r.status);
                }
            })
            .catch(function (e) { MessageBox.error("Update failed: " + e.message); });
        },

        // ── DELETE PO ────────────────────────────────────────────────
        onDeletePO: function () {
            var m = this.getView().getModel();
            var oPO = m.getProperty("/po_selectedPO");
            if (!oPO || !oPO.ID) { MessageBox.warning("No PO selected"); return; }

            MessageBox.confirm("Delete PO " + oPO.EBELN + "? This cannot be undone.", {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (sAction) {
                    if (sAction !== MessageBox.Action.YES) return;
                    // Delete header — CAP cascades to items automatically (Composition)
                    fetch(PO_BASE + "(" + oPO.ID + ")", { method: "DELETE" })
                        .then(function (r) {
                            if (r.ok || r.status === 204) {
                                MessageToast.show("PO " + oPO.EBELN + " deleted");
                                this.onBack();
                                this.onLoadData();
                            } else {
                                MessageBox.error("Delete failed: " + r.status);
                            }
                        }.bind(this))
                        .catch(function (e) { MessageBox.error("Delete failed: " + e.message); });
                }.bind(this)
            });
        },

        // ── UPDATE PANEL — Load items by PO Number ────────────────────
        onLoadItemsByPO: function () {
            var m = this.getView().getModel();
            var ebeln = m.getProperty("/po_searchEBELN");
            if (!ebeln || !ebeln.trim()) { MessageBox.warning("Enter PO Number (EBELN)"); return; }

            // First find the PO header by EBELN
            fetch(PO_BASE + "?$filter=EBELN eq '" + ebeln.trim() + "'")
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (!data.value || data.value.length === 0) {
                        MessageBox.warning("PO not found: " + ebeln);
                        return;
                    }
                    var po = data.value[0];
                    // Load items for this PO
                    return fetch(POI_BASE + "?$filter=up__ID eq '" + po.ID + "'")
                        .then(function (r) { return r.json(); })
                        .then(function (itemData) {
                            m.setProperty("/po_updateItems", itemData.value || []);
                            m.setProperty("/po_editItemMode", true);
                        });
                })
                .catch(function (e) { MessageBox.error("Load failed: " + e.message); });
        },

        // ── UPDATE SINGLE ITEM from update panel ─────────────────────
        onUpdateSingleItem: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext();
            var oItem = oCtx.getObject();

            fetch(POI_BASE + "(" + oItem.ID + ")", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ MENGE: parseFloat(oItem.MENGE) })
            })
            .then(function (r) {
                if (r.ok || r.status === 204) {
                    MessageToast.show("Item " + oItem.EBELP + " updated successfully");
                } else {
                    MessageBox.error("Update failed: " + r.status);
                }
            })
            .catch(function (e) { MessageBox.error("Update failed: " + e.message); });
        }
    });
});