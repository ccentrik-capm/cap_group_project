sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Input",
    "sap/m/Label",
    "sap/m/VBox",
    "sap/m/Text",
    "sap/m/Title"
], function (Controller, MessageToast, MessageBox, Input, Label, VBox, Text, Title) {
    "use strict";

    var BASE = "/odata/v4/vendor/Vendors";

    return Controller.extend("unified.controller.Vendor", {

        onInit: function () {
            this._inputs = {};
            this._currentVendorId = null;
            this._deleteVendor = null;
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("vendor").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            var m = this.getView().getModel();
            if (!m) return;
            m.setProperty("/vm_showOp", true);
            m.setProperty("/vm_showCreate", false);
            m.setProperty("/vm_showRead", false);
            m.setProperty("/vm_showUpdate", false);
            m.setProperty("/vm_showDelete", false);
        },

        onNavHome: function () {
            this.getOwnerComponent().getRouter().navTo("home");
        },

        // ── PANEL TOGGLE ─────────────────────────────────────────────
        onNavCreate: function () { this._showPanel("Create"); },
        onNavRead:   function () { this._showPanel("Read");   },
        onNavUpdate: function () { this._showPanel("Update"); },
        onNavDelete: function () { this._showPanel("Delete"); },

        _showPanel: function (sRoute) {
            var m = this.getView().getModel();
            m.setProperty("/vm_showOp",     false);
            m.setProperty("/vm_showCreate", sRoute === "Create");
            m.setProperty("/vm_showRead",   sRoute === "Read");
            m.setProperty("/vm_showUpdate", sRoute === "Update");
            m.setProperty("/vm_showDelete", sRoute === "Delete");
        },

        onBack: function () {
            var m = this.getView().getModel();
            m.setProperty("/vm_showOp", true);
            m.setProperty("/vm_showCreate", false);
            m.setProperty("/vm_showRead", false);
            m.setProperty("/vm_showUpdate", false);
            m.setProperty("/vm_showDelete", false);
            // Reset edit panel
            var oEditPanel = this.byId("vmEditPanel");
            if (oEditPanel) oEditPanel.setVisible(false);
            var oDeletePreview = this.byId("vmDeletePreview");
            if (oDeletePreview) oDeletePreview.setVisible(false);
        },

        // ── CREATE ───────────────────────────────────────────────────
        onSave: async function () {
            var data = {
                LIFNR: this.byId("vmIdInput").getValue().trim(),
                NAME1: this.byId("vmNameInput").getValue().trim(),
                ORT01: this.byId("vmCityInput").getValue().trim(),
                ADRNR: this.byId("vmAddrInput").getValue().trim(),
                PHONE: this.byId("vmPhoneInput").getValue().trim()
            };
            if (!data.LIFNR) { MessageBox.error("Vendor ID is required"); return; }
            if (!/^V\d{3,}$/.test(data.LIFNR)) { MessageBox.error("Vendor ID format: V001, V002..."); return; }
            if (!data.NAME1) { MessageBox.error("Vendor Name is required"); return; }
            try {
                var response = await fetch(BASE, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    var errBody = await response.json().catch(function () { return {}; });
                    throw new Error((errBody && errBody.error && errBody.error.message) || "Server error: " + response.status);
                }
                MessageToast.show("Vendor created successfully!");
                this.onClear();
            } catch (err) {
                MessageBox.error("Save failed: " + err.message);
            }
        },

        onClear: function () {
            ["vmIdInput", "vmNameInput", "vmCityInput", "vmAddrInput", "vmPhoneInput"]
                .forEach(function (id) { var c = this.byId(id); if (c) c.setValue(""); }.bind(this));
        },

        // ── READ ─────────────────────────────────────────────────────
        onFetch: async function () {
            var id = this.byId("vmReadIdInput").getValue().trim();
            if (!id) { MessageBox.error("Enter a Vendor ID"); return; }
            try {
                var response = await fetch(BASE + "('" + id + "')");
                if (response.status === 404) { MessageBox.error("Vendor not found: " + id); return; }
                if (!response.ok) throw new Error("Server error: " + response.status);
                var vendor = await response.json();
                this._renderReadResult(vendor);
            } catch (err) {
                MessageBox.error("Failed to fetch: " + err.message);
            }
        },

        _renderReadResult: function (vendor) {
            var container = this.byId("vmReadResult");
            container.destroyItems();
            var fields = [
                { label: "Vendor ID",      key: "LIFNR" },
                { label: "Vendor Name",    key: "NAME1" },
                { label: "City",           key: "ORT01" },
                { label: "Address Number", key: "ADRNR" },
                { label: "Phone Number",   key: "PHONE" }
            ];
            container.addItem(new Title({ text: "Vendor Details", level: "H3" }));
            fields.forEach(function (f) {
                var row = new VBox({ renderType: "Bare" });
                row.addItem(new Label({ text: f.label }));
                row.addItem(new Text({ text: vendor[f.key] || "—" }));
                container.addItem(row);
            });
        },

        // ── UPDATE ───────────────────────────────────────────────────
        onLoad: async function () {
            var id = this.byId("vmUpdateLookupId").getValue().trim();
            if (!id) { MessageBox.error("Enter a Vendor ID"); return; }
            try {
                var response = await fetch(BASE + "('" + id + "')");
                if (response.status === 404) { MessageBox.error("Vendor not found: " + id); return; }
                if (!response.ok) throw new Error("Server error: " + response.status);
                var vendor = await response.json();
                this._currentVendorId = vendor.LIFNR;
                this._renderUpdateForm(vendor);
            } catch (err) {
                MessageBox.error("Failed to fetch: " + err.message);
            }
        },

        _renderUpdateForm: function (vendor) {
            var form = this.byId("vmUpdateFormContainer");
            form.destroyContent();
            var fields = [
                { label: "Vendor ID",      key: "LIFNR", editable: false },
                { label: "Vendor Name",    key: "NAME1", editable: true  },
                { label: "City",           key: "ORT01", editable: true  },
                { label: "Address Number", key: "ADRNR", editable: true  },
                { label: "Phone Number",   key: "PHONE", editable: true  }
            ];
            this._inputs = {};
            fields.forEach(function (f) {
                var inp = new Input({ value: vendor[f.key] || "", editable: f.editable, width: "50%" });
                form.addContent(new Label({ text: f.label }));
                form.addContent(inp);
                this._inputs[f.key] = inp;
            }.bind(this));
            this.byId("vmEditPanel").setVisible(true);
        },

        onSaveUpdate: async function () {
            if (!this._currentVendorId) { MessageBox.error("Load a vendor first"); return; }
            var updated = {
                NAME1: this._inputs["NAME1"].getValue().trim(),
                ORT01: this._inputs["ORT01"].getValue().trim(),
                ADRNR: this._inputs["ADRNR"].getValue().trim(),
                PHONE: this._inputs["PHONE"].getValue().trim()
            };
            if (!updated.NAME1) { MessageBox.error("Vendor Name is required"); return; }
            try {
                var response = await fetch(BASE + "('" + this._currentVendorId + "')", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updated)
                });
                if (!response.ok) {
                    var errBody = await response.json().catch(function () { return {}; });
                    throw new Error((errBody && errBody.error && errBody.error.message) || "Server error: " + response.status);
                }
                MessageToast.show("Vendor updated successfully!");
            } catch (err) {
                MessageBox.error("Update failed: " + err.message);
            }
        },

        // ── DELETE ───────────────────────────────────────────────────
        onFetchDelete: async function () {
            var id = this.byId("vmDeleteIdInput").getValue().trim();
            if (!id) { MessageBox.error("Enter a Vendor ID"); return; }
            try {
                var response = await fetch(BASE + "('" + id + "')");
                if (response.status === 404) { MessageBox.error("Vendor not found: " + id); return; }
                if (!response.ok) throw new Error("Server error: " + response.status);
                var vendor = await response.json();
                this._deleteVendor = vendor;
                this._renderDeletePreview(vendor);
            } catch (err) {
                MessageBox.error("Failed to fetch: " + err.message);
            }
        },

        _renderDeletePreview: function (vendor) {
            var container = this.byId("vmDeleteResult");
            container.destroyItems();
            var fields = [
                { label: "Vendor ID",      key: "LIFNR" },
                { label: "Vendor Name",    key: "NAME1" },
                { label: "City",           key: "ORT01" },
                { label: "Address Number", key: "ADRNR" },
                { label: "Phone Number",   key: "PHONE" }
            ];
            container.addItem(new Title({ text: "Vendor to Delete", level: "H3" }));
            fields.forEach(function (f) {
                var row = new VBox({ renderType: "Bare" });
                row.addItem(new Label({ text: f.label }));
                row.addItem(new Text({ text: vendor[f.key] || "—" }));
                container.addItem(row);
            });
            this.byId("vmDeletePreview").setVisible(true);
        },

        onConfirmDelete: async function () {
            if (!this._deleteVendor) return;
            try {
                var response = await fetch(BASE + "('" + this._deleteVendor.LIFNR + "')", { method: "DELETE" });
                if (!response.ok) {
                    var errBody = await response.json().catch(function () { return {}; });
                    throw new Error((errBody && errBody.error && errBody.error.message) || "Server error: " + response.status);
                }
                MessageToast.show("Vendor " + this._deleteVendor.LIFNR + " deleted!");
                this.byId("vmDeleteIdInput").setValue("");
                this.byId("vmDeleteResult").destroyItems();
                this.byId("vmDeletePreview").setVisible(false);
                this._deleteVendor = null;
            } catch (err) {
                MessageBox.error("Delete failed: " + err.message);
            }
        },

        onCancelDelete: function () {
            this.byId("vmDeleteResult").destroyItems();
            this.byId("vmDeletePreview").setVisible(false);
            this._deleteVendor = null;
        }
    });
});
