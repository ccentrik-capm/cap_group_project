sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("unified.controller.Home", {

        onInit: function () {},

        onNavSalesOrder: function () {
            this.getOwnerComponent().getRouter().navTo("salesorder");
        },

        onNavSalesItem: function () {
            this.getOwnerComponent().getRouter().navTo("salesitem");
        },

        onNavCustomer: function () {
            this.getOwnerComponent().getRouter().navTo("customer");
        },

        onNavVendor: function () {
            this.getOwnerComponent().getRouter().navTo("vendor");
        },

        onNavPurchase: function () {
            this.getOwnerComponent().getRouter().navTo("purchase");
        },
        
        onNavMaterial: function () {
            this.getOwnerComponent().getRouter().navTo("material");
        }
    });
});
