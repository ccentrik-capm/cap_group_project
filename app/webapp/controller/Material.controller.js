sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/Text",
    "sap/m/ColumnListItem"
], function (Controller, MessageBox, MessageToast, Text, ColumnListItem) {
    "use strict";

    return Controller.extend("unified.controller.Material", {


        onInit: function () {
            this._oUpdateContext = null;
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("material").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            var m = this.getView().getModel();
            if (!m) return;
            m.setProperty("/mat_showOp",           true);
            m.setProperty("/mat_showCreate",        false);
            m.setProperty("/mat_showRead",          false);
            m.setProperty("/mat_showUpdate",        false);
            m.setProperty("/mat_showDelete",        false);
            m.setProperty("/mat_showReadResult",    false);
            m.setProperty("/mat_showUpdateForm",    false);
            m.setProperty("/mat_showDeleteResult",  false);
            m.setProperty("/mat_searchMatnr",       "");
            m.setProperty("/mat_searchKunnr",       "");
            m.setProperty("/mat_deleteMatnr",       "");
            m.setProperty("/mat_create", { MATNR: "", MTART: "", MBRSH: "", MATKL: "", PSTAT: "" });
            m.setProperty("/mat_update", { MATNR: "", MTART: "", MBRSH: "", MATKL: "", PSTAT: "" });
            this._oUpdateContext = null;
        },

        // ─────────────────────────────────────────────────────────────
        // HELPER — returns named "material" OData v4 model
        // ─────────────────────────────────────────────────────────────

        _getODataModel: function () {
            return this.getOwnerComponent().getModel("material");
        },

        // ─────────────────────────────────────────────────────────────
        // HELPER — show one panel, hide all others
        // ─────────────────────────────────────────────────────────────

        _showSection: function (sSection) {
            var m = this.getView().getModel();
            m.setProperty("/mat_showOp",          sSection === "op");
            m.setProperty("/mat_showCreate",       sSection === "create");
            m.setProperty("/mat_showRead",         sSection === "read");
            m.setProperty("/mat_showUpdate",       sSection === "update");
            m.setProperty("/mat_showDelete",       sSection === "delete");
            m.setProperty("/mat_showReadResult",   false);
            m.setProperty("/mat_showUpdateForm",   false);
            m.setProperty("/mat_showDeleteResult", false);
        },

        // ─────────────────────────────────────────────────────────────
        // NAVIGATION
        // ─────────────────────────────────────────────────────────────

        onNavHome: function () {
            this.getOwnerComponent().getRouter().navTo("home");
        },

        onMaterialCreate: function () {
            this._showSection("create");
            this.getView().getModel().setProperty("/mat_create",
                { MATNR: "", MTART: "", MBRSH: "", MATKL: "", PSTAT: "" });
        },

        onMaterialRead: function () {
            this._showSection("read");
            this.getView().getModel().setProperty("/mat_searchMatnr", "");
            this._loadAllMaterials();
        },

        onMaterialUpdate: function () {
            this._showSection("update");
            this.getView().getModel().setProperty("/mat_searchKunnr", "");
            this._oUpdateContext = null;
        },

        onMaterialDelete: function () {
            this._showSection("delete");
            this.getView().getModel().setProperty("/mat_deleteMatnr", "");
        },

        onMaterialBack: function () {
            this._showSection("op");
        },

        // ─────────────────────────────────────────────────────────────
        // CREATE
        // ─────────────────────────────────────────────────────────────

        onSaveMaterial: function () {
            var m     = this.getView().getModel();
            var oData = m.getProperty("/mat_create");

            if (!oData.MATNR || !oData.MATNR.trim()) { MessageBox.warning("Material Number is required."); return; }
            if (!oData.MTART || !oData.MTART.trim()) { MessageBox.warning("Material Type is required.");   return; }

            try {
                this._getODataModel().bindList("/ZMARA").create({
                    MATNR: oData.MATNR.trim().toUpperCase(),
                    MTART: oData.MTART.trim().toUpperCase(),
                    MBRSH: oData.MBRSH.trim().toUpperCase(),
                    MATKL: oData.MATKL.trim(),
                    PSTAT: oData.PSTAT.trim()
                });
                MessageToast.show("Material '" + oData.MATNR + "' created successfully.");
                this.onClearMaterial();
            } catch (oError) {
                MessageBox.error("Failed to create material: " + oError.message);
            }
        },

        onClearMaterial: function () {
            this.getView().getModel().setProperty("/mat_create",
                { MATNR: "", MTART: "", MBRSH: "", MATKL: "", PSTAT: "" });
        },

        // ─────────────────────────────────────────────────────────────
        // READ
        // ─────────────────────────────────────────────────────────────

        _getReadTemplate: function () {
            return new ColumnListItem({
                cells: [
                    new Text({ text: "{material>MATNR}" }),
                    new Text({ text: "{material>MTART}" }),
                    new Text({ text: "{material>MBRSH}" }),
                    new Text({ text: "{material>MATKL}" }),
                    new Text({ text: "{material>PSTAT}" })
                ]
            });
        },

        _loadAllMaterials: function () {
            var oTable = this.byId("mat_resultsTable");
            if (!oTable) return;
            oTable.bindItems({ path: "/ZMARA", model: "material", template: this._getReadTemplate() });
            this.getView().getModel().setProperty("/mat_showReadResult", true);
        },

        onSearchMaterial: function () {
            var m      = this.getView().getModel();
            var sMatnr = m.getProperty("/mat_searchMatnr").trim();
            var sPath  = sMatnr ? "/ZMARA?$filter=MATNR eq '" + sMatnr + "'" : "/ZMARA";
            this.byId("mat_resultsTable").bindItems({ path: sPath, model: "material", template: this._getReadTemplate() });
            m.setProperty("/mat_showReadResult", true);
        },

        onShowAllMaterial: function () {
            this.getView().getModel().setProperty("/mat_searchMatnr", "");
            this._loadAllMaterials();
        },

        // ─────────────────────────────────────────────────────────────
        // UPDATE
        // ─────────────────────────────────────────────────────────────

        onLoadMaterial: function () {
            var m      = this.getView().getModel();
            var sMatnr = m.getProperty("/mat_searchKunnr").trim();
            if (!sMatnr) { MessageBox.warning("Please enter a Material Number."); return; }

            var oBinding = this._getODataModel().bindContext("/ZMARA('" + sMatnr + "')");
            oBinding.requestObject().then(function (oData) {
                m.setProperty("/mat_update", {
                    MATNR: oData.MATNR,
                    MTART: oData.MTART,
                    MBRSH: oData.MBRSH,
                    MATKL: oData.MATKL,
                    PSTAT: oData.PSTAT
                });
                m.setProperty("/mat_showUpdateForm", true);
                this._oUpdateContext = oBinding.getBoundContext();
            }.bind(this)).catch(function () {
                MessageBox.error("Material '" + sMatnr + "' not found.");
            });
        },

        onUpdateMaterial: function () {
            if (!this._oUpdateContext) { MessageBox.error("Please load a material first."); return; }

            var oData = this.getView().getModel().getProperty("/mat_update");
            this._oUpdateContext.setProperty("MTART", oData.MTART);
            this._oUpdateContext.setProperty("MBRSH", oData.MBRSH);
            this._oUpdateContext.setProperty("MATKL", oData.MATKL);
            this._oUpdateContext.setProperty("PSTAT", oData.PSTAT);

            this._getODataModel().submitBatch("$auto").then(function () {
                MessageToast.show("Material updated successfully.");
                var m = this.getView().getModel();
                m.setProperty("/mat_showUpdateForm", false);
                m.setProperty("/mat_searchKunnr", "");
                this._oUpdateContext = null;
            }.bind(this)).catch(function () {
                MessageBox.error("Update failed.");
            });
        },

        onCancelUpdate: function () {
            var m = this.getView().getModel();
            m.setProperty("/mat_showUpdateForm", false);
            m.setProperty("/mat_searchKunnr", "");
            this._oUpdateContext = null;
        },

        // ─────────────────────────────────────────────────────────────
        // DELETE
        // ─────────────────────────────────────────────────────────────

        onDeleteSearchMaterial: function () {
            var m      = this.getView().getModel();
            var sMatnr = m.getProperty("/mat_deleteMatnr").trim();
            var sPath  = sMatnr ? "/ZMARA?$filter=contains(MATNR,'" + sMatnr + "')" : "/ZMARA";
            this.byId("mat_deleteTable").bindItems({
                path: sPath, model: "material",
                template: new ColumnListItem({
                    cells: [
                        new Text({ text: "{material>MATNR}" }),
                        new Text({ text: "{material>MTART}" }),
                        new Text({ text: "{material>MBRSH}" }),
                        new Text({ text: "{material>MATKL}" }),
                        new Text({ text: "{material>PSTAT}" })
                    ]
                })
            });
            m.setProperty("/mat_showDeleteResult", true);
        },

        onDeleteSelectedMaterial: function () {
            var oTable = this.byId("mat_deleteTable");
            var aItems = oTable.getSelectedItems();
            if (!aItems.length) { MessageBox.warning("Select at least one material to delete."); return; }

            MessageBox.confirm("Delete " + aItems.length + " material(s)?", {
                onClose: function (sAction) {
                    if (sAction !== MessageBox.Action.OK) return;
                    Promise.all(aItems.map(function (oItem) {
                        return oItem.getBindingContext("material").delete("$auto");
                    })).then(function () {
                        MessageToast.show("Deleted successfully.");
                        var m = this.getView().getModel();
                        m.setProperty("/mat_showDeleteResult", false);
                        m.setProperty("/mat_deleteMatnr", "");
                    }.bind(this)).catch(function () {
                        MessageBox.error("Delete failed.");
                    });
                }.bind(this)
            });
        }
    });
});