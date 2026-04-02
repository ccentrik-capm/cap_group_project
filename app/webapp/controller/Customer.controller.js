sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Label",
    "sap/m/VBox",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, Dialog, Button, Input, Label, VBox, MessageToast, MessageBox, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("unified.controller.Customer", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("customer").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            var oTable = this.byId("customerTable");
            if (oTable && oTable.getBinding("rows")) {
                oTable.getBinding("rows").refresh();
            }
        },

        onNavHome: function () {
            this.getOwnerComponent().getRouter().navTo("home");
        },

        _capitalize: function (str) {
            if (!str) return str;
            return str.replace(/\b\w/g, function (l) { return l.toUpperCase(); });
        },

        // ── SEARCH ───────────────────────────────────────────────────
        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");
            var oTable = this.byId("customerTable");
            var oBinding = oTable.getBinding("rows");
            if (sQuery && sQuery.trim()) {
                var aFilters = [
                    new Filter({ path: "customerName", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                    new Filter({ path: "city",         operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                    new Filter({ path: "phone",        operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false })
                ];
                oBinding.filter(new Filter(aFilters, false));
            } else {
                oBinding.filter([]);
            }
        },

        // ── CREATE ───────────────────────────────────────────────────
        onCreatePress: function () {
            var that = this;
            var oModel = this.getView().getModel("customer");
            var oListBinding = oModel.bindList("/Customers");
            oListBinding.requestContexts().then(function (aCtx) {
                var iMax = 0;
                aCtx.forEach(function (c) { var id = c.getProperty("CustomerID"); if (id > iMax) iMax = id; });
                that._openCreateDialog(iMax + 1);
            }).catch(function () { that._openCreateDialog(1); });
        },

        _openCreateDialog: function (nextId) {
            var that = this;
            var oIdIn    = new Input({ value: String(nextId), type: "Number" });
            var oNameIn  = new Input({ placeholder: "Customer Name", liveChange: function (e) { var v = e.getSource().getValue(); var c = that._capitalize(v); if (v !== c) e.getSource().setValue(c); } });
            var oCityIn  = new Input({ placeholder: "City",          liveChange: function (e) { var v = e.getSource().getValue(); var c = that._capitalize(v); if (v !== c) e.getSource().setValue(c); } });
            var oAddrIn  = new Input({ placeholder: "Address Number",liveChange: function (e) { var v = e.getSource().getValue(); var c = that._capitalize(v); if (v !== c) e.getSource().setValue(c); } });
            var oPhoneIn = new Input({ placeholder: "10 digits", type: "Tel", maxLength: 10,
                liveChange: function (e) { var v = e.getSource().getValue(); var s = v.replace(/\D/g, "").substring(0, 10); if (v !== s) e.getSource().setValue(s); }
            });
            var oDialog = new Dialog({
                title: "Create New Customer",
                content: [new VBox({ items: [
                    new Label({ text: "Customer ID", required: true }), oIdIn,
                    new Label({ text: "Customer Name", required: true }), oNameIn,
                    new Label({ text: "City", required: true }), oCityIn,
                    new Label({ text: "Address Number", required: true }), oAddrIn,
                    new Label({ text: "Phone Number (10 digits)", required: true }), oPhoneIn
                ]}).addStyleClass("sapUiSmallMargin")],
                beginButton: new Button({ text: "Save", type: "Emphasized", press: function () {
                    if (oPhoneIn.getValue().length !== 10) { MessageToast.show("Phone must be 10 digits"); return; }
                    var oData = {
                        CustomerID: parseInt(oIdIn.getValue()),
                        customerName: that._capitalize(oNameIn.getValue()),
                        city: that._capitalize(oCityIn.getValue()),
                        addressNo: that._capitalize(oAddrIn.getValue()),
                        phone: oPhoneIn.getValue()
                    };
                    if (!oData.CustomerID || !oData.customerName || !oData.city || !oData.addressNo || !oData.phone) {
                        MessageToast.show("Fill all fields"); return;
                    }
                    var oListBinding = that.getView().getModel("customer").bindList("/Customers");
                    oListBinding.create(oData).created()
                        .then(function () { MessageToast.show("Customer created!"); })
                        .catch(function (e) { MessageToast.show("Error: " + e.message); });
                    oDialog.close(); oDialog.destroy();
                }}),
                endButton: new Button({ text: "Cancel", press: function () { oDialog.close(); oDialog.destroy(); } })
            });
            this.getView().addDependent(oDialog);
            oDialog.open();
        },

        // ── VIEW ─────────────────────────────────────────────────────
        onViewPress: function () {
            var that = this;
            var oViewIn = new Input({ placeholder: "Customer ID (empty = all)", type: "Number" });
            var oDialog = new Dialog({
                title: "View Customer",
                content: [new VBox({ items: [new Label({ text: "Customer ID (optional)" }), oViewIn] }).addStyleClass("sapUiSmallMargin")],
                beginButton: new Button({ text: "View", type: "Emphasized", press: function () {
                    var sId = oViewIn.getValue().trim();
                    var oTable = that.byId("customerTable");
                    var oBinding = oTable.getBinding("rows");
                    if (sId) {
                        oBinding.filter([new Filter("CustomerID", FilterOperator.EQ, parseInt(sId))]);
                        MessageToast.show("Showing customer: " + sId);
                    } else {
                        oBinding.filter([]);
                        MessageToast.show("Showing all customers");
                    }
                    oDialog.close(); oDialog.destroy();
                }}),
                endButton: new Button({ text: "Cancel", press: function () { oDialog.close(); oDialog.destroy(); } })
            });
            this.getView().addDependent(oDialog);
            oDialog.open();
        },

        // ── EDIT ─────────────────────────────────────────────────────
        onEditPress: function () {
            var that = this;
            var oTable = this.byId("customerTable");
            var aIdx = oTable.getSelectedIndices();
            if (!aIdx.length) { MessageBox.warning("Select a customer to edit"); return; }
            if (aIdx.length > 1) { MessageBox.warning("Select only one customer"); return; }
            var oCtx = oTable.getBinding("rows").getContexts()[aIdx[0]];
            var oData = oCtx.getObject();
            var oCityIn  = new Input({ value: oData.city,      placeholder: "City" });
            var oAddrIn  = new Input({ value: oData.addressNo, placeholder: "Address" });
            var oPhoneIn = new Input({ value: oData.phone,     placeholder: "10 digits", type: "Tel", maxLength: 10 });
            var oDialog = new Dialog({
                title: "Edit Customer",
                content: [new VBox({ items: [
                    new Label({ text: "Customer ID (read only)" }), new Input({ value: String(oData.CustomerID), enabled: false }),
                    new Label({ text: "Name (read only)" }),        new Input({ value: oData.customerName, enabled: false }),
                    new Label({ text: "City", required: true }),    oCityIn,
                    new Label({ text: "Address", required: true }), oAddrIn,
                    new Label({ text: "Phone", required: true }),   oPhoneIn
                ]}).addStyleClass("sapUiSmallMargin")],
                beginButton: new Button({ text: "Update", type: "Emphasized", press: function () {
                    if (oPhoneIn.getValue().length !== 10) { MessageToast.show("Phone must be 10 digits"); return; }
                    oCtx.setProperty("city",      that._capitalize(oCityIn.getValue()));
                    oCtx.setProperty("addressNo", that._capitalize(oAddrIn.getValue()));
                    oCtx.setProperty("phone",     oPhoneIn.getValue());
                    oCtx.getModel().submitBatch("$auto")
                        .then(function () { MessageToast.show("Customer updated!"); })
                        .catch(function (e) { MessageToast.show("Error: " + e.message); });
                    oDialog.close(); oDialog.destroy();
                    oTable.clearSelection();
                }}),
                endButton: new Button({ text: "Cancel", press: function () { oDialog.close(); oDialog.destroy(); } })
            });
            this.getView().addDependent(oDialog);
            oDialog.open();
        },

        // ── DELETE ───────────────────────────────────────────────────
        onDeletePress: function () {
            var oTable = this.byId("customerTable");
            var aIdx = oTable.getSelectedIndices();
            if (!aIdx.length) { MessageBox.warning("Select at least one customer"); return; }
            MessageBox.confirm("Delete " + aIdx.length + " customer(s)?", {
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        var oBinding = oTable.getBinding("rows");
                        aIdx.reverse().forEach(function (i) {
                            var oCtx = oBinding.getContexts()[i];
                            if (oCtx) oCtx.delete();
                        });
                        oTable.clearSelection();
                        MessageToast.show("Customer(s) deleted!");
                    }
                }.bind(this)
            });
        }
    });
});
