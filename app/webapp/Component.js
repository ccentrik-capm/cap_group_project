sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v4/ODataModel"
], function (UIComponent, JSONModel, ODataModel) {
    "use strict";

    return UIComponent.extend("unified.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            // ── Shared JSON model (Sales Order / Sales Item / Vendor / PO state) ──
            var oModel = new JSONModel({
                // ── Sales Order ──────────────────────────────────────
                so_showOp: true,
                so_showCreate: false,
                so_showRead: false,
                so_showUpdate: false,
                so_showDelete: false,
                so_showReadResult: false,
                so_showDeleteResult: false,
                so_editMode: false,
                so_createPayload: {},
                so_editPayload: {},
                so_salesOrders: [],
                so_readVBELN: "",
                so_searchVBELN: "",
                so_deleteVBELN: "",

                // ── Sales Item ───────────────────────────────────────
                si_showOp: true,
                si_showCreate: false,
                si_showRead: false,
                si_showUpdate: false,
                si_showDelete: false,
                si_showReadResult: false,
                si_showDeleteResult: false,
                si_editMode: false,
                si_createPayload: {},
                si_editPayload: {},
                si_salesItems: [],
                si_readVBELN: "",
                si_readPOSNR: "",
                si_searchVBELN: "",
                si_searchPOSNR: "",
                si_deleteVBELN: "",
                si_deletePOSNR: "",

                // ── Vendor Master ────────────────────────────────────
                vm_showOp: true,
                vm_showCreate: false,
                vm_showRead: false,
                vm_showUpdate: false,
                vm_showDelete: false,
                vm_vendorId: "",
                vm_showReadResult: false,
                vm_showDeletePreview: false,
                vm_editPanel: false,
                vm_currentVendorId: "",
                vm_editForm: { LIFNR: "", NAME1: "", ORT01: "", ADRNR: "", PHONE: "" },

                // ── Purchase Order ───────────────────────────────────
                po_showOp: true,
                po_showCreate: false,
                po_showRead: false,
                po_showUpdate: false,
                po_showDetail: false,
                po_POHeader: [],
                po_POItems: [],
                po_selectedPO: {},
                po_selectedPOItems: [],
                po_searchItemId: "",
                po_editItemMode: false,
                po_editItemPayload: {},
                po_createPayload: {
                    EBELN: "", BUKRS: "", BSART: "", LIFNR: "",
                    AEDAT: new Date().toISOString().split("T")[0],
                    ZTERM: "", currency: "",
                    items: [{ EBELP: 10, MATNR: "", MENGE: null, MEINS: "", WERKS: "", NETPR: null }]
                },
                po_vendorList: [
                    { LIFNR: "V001", NAME: "Bosch Ltd" },
                    { LIFNR: "V002", NAME: "Tata Steel" },
                    { LIFNR: "V003", NAME: "Siemens AG" },
                    { LIFNR: "V004", NAME: "Mahindra Logistics" },
                    { LIFNR: "V005", NAME: "ABB India" }
                ],
                po_materialList: [
                    { MATNR: "MAT001", MAKTX: "Brake Disc" },
                    { MATNR: "MAT002", MAKTX: "Fuel Injector" },
                    { MATNR: "MAT003", MAKTX: "Spark Plug" },
                    { MATNR: "MAT004", MAKTX: "Steel Sheet 2mm" },
                    { MATNR: "MAT005", MAKTX: "Bearing 6205" }
                ],

                // ── Material Master ──────────────────────────────────
                mat_showOp:           true,
                mat_showCreate:       false,
                mat_showRead:         false,
                mat_showUpdate:       false,
                mat_showDelete:       false,
                mat_showReadResult:   false,
                mat_showUpdateForm:   false,
                mat_showDeleteResult: false,
                mat_searchMatnr:      "",
                mat_searchKunnr:      "",
                mat_deleteMatnr:      "",
                mat_create: { MATNR: "", MTART: "", MBRSH: "", MATKL: "", PSTAT: "" },
                mat_update: { MATNR: "", MTART: "", MBRSH: "", MATKL: "", PSTAT: "" },
                mat_deleteResults:    []
            });
            this.setModel(oModel);

            // ── OData model: Customer ─────────────────────────────────
            var oCmModel = new ODataModel({
                serviceUrl: "/odata/v4/customer/",
                synchronizationMode: "None",
                operationMode: "Server",
                autoExpandSelect: true
            });
            this.setModel(oCmModel, "customer");

            // ── OData model: Material Master ──────────────────────────
            var oMaterialModel = new ODataModel({
                serviceUrl: "/odata/v4/material-master/",
                synchronizationMode: "None",
                operationMode: "Server",
                autoExpandSelect: true
            });
            this.setModel(oMaterialModel, "material");

            this.getRouter().initialize();
        }
    });
});