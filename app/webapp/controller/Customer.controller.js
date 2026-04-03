sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
    "use strict";

    var BASE = "/c-customer/Customer";

    return Controller.extend("unified.controller.Customer", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("customer").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            var m = this.getView().getModel();
            if (!m) return;
            m.setProperty("/cm_showOp", true);
            m.setProperty("/cm_showCreate", false);
            m.setProperty("/cm_showRead", false);
            m.setProperty("/cm_showUpdate", false);
            m.setProperty("/cm_showDelete", false);
            m.setProperty("/cm_showReadResult", false);
            m.setProperty("/cm_showDeleteResult", false);
            m.setProperty("/cm_editMode", false);
            m.setProperty("/cm_customers", []);
            m.setProperty("/cm_createPayload", { kunnr: "", name1: "", orto1: "", adrnr: "", phone: "" });
            m.setProperty("/cm_editPayload", {});
            m.setProperty("/cm_searchQuery", "");
            m.setProperty("/cm_searchKunnr", "");
            m.setProperty("/cm_deleteKunnr", "");
        },

        onNavHome: function () {
            this.getOwnerComponent().getRouter().navTo("home");
        },

        _capitalize: function (str) {
            if (!str) return str;
            return str.replace(/\b\w/g, function (l) { return l.toUpperCase(); });
        },

        // ── PANEL TOGGLE ─────────────────────────────────────────────
        onCreate: function () {
            var m = this.getView().getModel();
            m.setProperty("/cm_showOp", false);
            m.setProperty("/cm_showCreate", true);
            m.setProperty("/cm_showRead", false);
            m.setProperty("/cm_showUpdate", false);
            m.setProperty("/cm_showDelete", false);
            m.setProperty("/cm_createPayload", { kunnr: "", name1: "", orto1: "", adrnr: "", phone: "" });
        },

        onRead: function () {
            var m = this.getView().getModel();
            m.setProperty("/cm_showOp", false);
            m.setProperty("/cm_showCreate", false);
            m.setProperty("/cm_showRead", true);
            m.setProperty("/cm_showUpdate", false);
            m.setProperty("/cm_showDelete", false);
            m.setProperty("/cm_searchQuery", "");
            //to Load all customers by default
            fetch(BASE)
                .then(function (r) { return r.json(); })
                .then(function (d) {
                    m.setProperty("/cm_customers", d.value || []);
                    m.setProperty("/cm_showReadResult", true);
                })
                .catch(function () { MessageBox.error("Unable to fetch customers"); });
        },

        onUpdate: function () {
            var m = this.getView().getModel();
            m.setProperty("/cm_showOp", false);
            m.setProperty("/cm_showCreate", false);
            m.setProperty("/cm_showRead", false);
            m.setProperty("/cm_showUpdate", true);
            m.setProperty("/cm_showDelete", false);
            m.setProperty("/cm_editMode", false);
            m.setProperty("/cm_searchKunnr", "");
        },

        onDelete: function () {
            var m = this.getView().getModel();
            m.setProperty("/cm_showOp", false);
            m.setProperty("/cm_showCreate", false);
            m.setProperty("/cm_showRead", false);
            m.setProperty("/cm_showUpdate", false);
            m.setProperty("/cm_showDelete", true);
            m.setProperty("/cm_showDeleteResult", false);
            m.setProperty("/cm_deleteKunnr", "");
        },

        onBack: function () {
            var m = this.getView().getModel();
            m.setProperty("/cm_showOp", true);
            m.setProperty("/cm_showCreate", false);
            m.setProperty("/cm_showRead", false);
            m.setProperty("/cm_showUpdate", false);
            m.setProperty("/cm_showDelete", false);
            m.setProperty("/cm_showReadResult", false);
            m.setProperty("/cm_showDeleteResult", false);
            m.setProperty("/cm_editMode", false);
        },

        // ── CREATE ───────────────────────────────────────────────────
        onSave: function () {
            var m = this.getView().getModel();
            var p = m.getProperty("/cm_createPayload");

            if (!p.kunnr || !p.kunnr.trim()) { MessageBox.warning("Customer ID (kunnr) required"); return; }
            if (!p.name1 || !p.name1.trim()) { MessageBox.warning("Customer Name (name1) required"); return; }
            if (!p.orto1 || !p.orto1.trim()) { MessageBox.warning("City (orto1) required"); return; }
            if (!p.adrnr || !p.adrnr.trim()) { MessageBox.warning("Address No (adrnr) required"); return; }
            if (!p.phone || !p.phone.trim()) { MessageBox.warning("Phone required"); return; }

            var body = {
                kunnr: p.kunnr.trim(),
                name1: this._capitalize(p.name1.trim()),
                orto1: this._capitalize(p.orto1.trim()),
                adrnr: p.adrnr.trim(),
                phone: p.phone.trim()
            };

            fetch(BASE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })
            .then(function (r) {
                if (r.ok || r.status === 201) {
                    MessageToast.show("Customer Created Successfully");
                    m.setProperty("/cm_createPayload", { kunnr: "", name1: "", orto1: "", adrnr: "", phone: "" });
                } else {
                    return r.json().then(function (e) {
                        MessageBox.error((e.error && e.error.message) || "Creation Failed");
                    });
                }
            })
            .catch(function () { MessageBox.error("Network Error"); });
        },

        // ── READ / SEARCH ─────────────────────────────────────────────
        onSearchCustomer: function () {
            var m = this.getView().getModel();
            var q = m.getProperty("/cm_searchQuery");
            var url = BASE;
            if (q && q.trim()) {
                // Search by name1, orto1, or phone using contains
                url = BASE + "?$filter=contains(name1,'" + q.trim() +
                    "') or contains(orto1,'" + q.trim() +
                    "') or contains(phone,'" + q.trim() + "')";
            }
            fetch(url)
                .then(function (r) { return r.json(); })
                .then(function (d) {
                    m.setProperty("/cm_customers", d.value || []);
                    m.setProperty("/cm_showReadResult", true);
                })
                .catch(function () { MessageBox.error("Search failed"); });
        },

        onShowAll: function () {
            var m = this.getView().getModel();
            m.setProperty("/cm_searchQuery", "");
            fetch(BASE)
                .then(function (r) { return r.json(); })
                .then(function (d) {
                    m.setProperty("/cm_customers", d.value || []);
                    m.setProperty("/cm_showReadResult", true);
                })
                .catch(function () { MessageBox.error("Fetch failed"); });
        },

        // ── UPDATE LOAD ───────────────────────────────────────────────
        onEditCustomer: function () {
            var m = this.getView().getModel();
            var kunnr = m.getProperty("/cm_searchKunnr");
            if (!kunnr || !kunnr.trim()) { MessageBox.warning("Enter Customer ID"); return; }

            fetch(BASE + "('" + kunnr.trim() + "')")
                .then(function (r) {
                    if (r.status === 404) throw new Error("Customer not found");
                    if (!r.ok) throw new Error("Error " + r.status);
                    return r.json();
                })
                .then(function (d) {
                    m.setProperty("/cm_editPayload", d);
                    m.setProperty("/cm_editMode", true);
                })
                .catch(function (e) { MessageBox.error(e.message || "Not found"); });
        },

        // ── UPDATE SAVE ───────────────────────────────────────────────
        onUpdateCustomer: function () {
            var m = this.getView().getModel();
            var p = m.getProperty("/cm_editPayload");
            if (!p.kunnr) { MessageBox.warning("Customer ID missing"); return; }

            var body = {
                orto1: this._capitalize(p.orto1 || ""),
                adrnr: p.adrnr || "",
                phone: p.phone || ""
            };

            fetch(BASE + "('" + p.kunnr + "')", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })
            .then(function (r) {
                if (r.ok || r.status === 204) {
                    MessageToast.show("Customer Updated Successfully");
                    m.setProperty("/cm_editMode", false);
                    m.setProperty("/cm_searchKunnr", "");
                } else {
                    MessageBox.error("Update Failed");
                }
            })
            .catch(function () { MessageBox.error("Network Error"); });
        },

        onCancelEdit: function () {
            this.getView().getModel().setProperty("/cm_editMode", false);
        },

        // ── DELETE SEARCH ─────────────────────────────────────────────
        onDeleteSearch: function () {
            var m = this.getView().getModel();
            var kunnr = m.getProperty("/cm_deleteKunnr");
            var url = kunnr && kunnr.trim()
                ? BASE + "?$filter=contains(kunnr,'" + kunnr.trim() + "')"
                : BASE;

            fetch(url)
                .then(function (r) { return r.json(); })
                .then(function (d) {
                    m.setProperty("/cm_customers", d.value || []);
                    m.setProperty("/cm_showDeleteResult", true);
                })
                .catch(function () { MessageBox.error("Search failed"); });
        },

        // ── DELETE ────────────────────────────────────────────────────
        onDeleteSelected: function () {
            var table = this.byId("cmDeleteTable");
            var indices = table.getSelectedIndices();
            if (!indices.length) { MessageBox.warning("Select rows first"); return; }

            var model = this.getView().getModel();
            var rows = model.getProperty("/cm_customers");

            MessageBox.confirm("Delete " + indices.length + " customer(s)?", {
                onClose: function (action) {
                    if (action === MessageBox.Action.OK) {
                        Promise.all(indices.map(function (i) {
                            return fetch(BASE + "('" + rows[i].kunnr + "')", { method: "DELETE" });
                        }))
                        .then(function () {
                            MessageToast.show("Deleted Successfully");
                            model.setProperty("/cm_showDeleteResult", false);
                            model.setProperty("/cm_customers", []);
                            model.setProperty("/cm_deleteKunnr", "");
                        })
                        .catch(function () { MessageBox.error("Delete failed"); });
                    }
                }.bind(this)
            });
        }
    });
});