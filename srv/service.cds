// using { com.project.salesorder.SOHeaderTable as headertable } from '../db/ZSO_JV_3003';
// using { com.project.salesorder.SOItemTable as Itemtable } from '../db/ZSO_JV_3003';
// using { com.project.customer.Customer as customertable } from '../db/ZCM_PU_2703';
// using { com.project.purchaseorder.PurchaseOrder as purchasetable } from '../db/ZMM_AP_2803';
// using { com.project.purchaseorder.PurchaseOrderItem as purchaseitemtable } from '../db/ZMM_AP_2803';
// using { com.project.vendormaster.VendorMaster as vendortable } from '../db/ZVM_ST_2703';
// using { com.project.material.ZMARA as mat1 } from '../db/ZMM_AR_2703';
// using { com.project.material.ZMARC as mat2 } from '../db/ZMM_AR_2703';
// using { com.project.material.ZMARD as mat3 } from '../db/ZMM_AR_2703';
// using { com.project.material.ZMAKTX as mat4 } from '../db/ZMM_AR_2703';
// using { com.project.material.ZMAT_STORAGE as mat5 } from '../db/ZMM_AR_2703';



// service SO_Headertable {
//     entity So_Orderstable as projection on headertable;

// }
// service SO_Itemtable {
//     entity So_Itemstables as projection on Itemtable;

// }
// service C_customer {
//     entity Customer as projection on customertable;

// }
// service PoTable {
//     entity po_headertable as projection on purchasetable;

// }
// service PoItem {
//     entity po_itemtable as projection on purchaseitemtable;

// }

// service vendorService {
//     entity VendorMaster as projection on vendortable;

// }
// service MaterialService1 {
//     entity mara as projection on mat1;

// }

// service Materialservice2 {
//     entity marc as projection on mat2;

// }
// service MaterialService3 {
//     entity mara as projection on mat3;

// }

// service Materialservice4 {
//     entity marc as projection on mat4;

// }
// service MaterialService5 {
//     entity mara as projection on mat5;

// }


using { com.project.salesorder.SOHeaderTable as headertable } from '../db/ZSO_JV_3003';
using { com.project.salesorder.SOItemTable as Itemtable } from '../db/ZSO_JV_3003';
using { com.project.customer.Customer as customertable } from '../db/ZCM_PU_2703';
using { com.project.purchaseorder.PurchaseOrder as purchasetable } from '../db/ZMM_AP_2803';
using { com.project.purchaseorder.PurchaseOrderItem as purchaseitemtable } from '../db/ZMM_AP_2803';
using { com.project.vendormaster.VendorMaster as vendortable } from '../db/ZVM_ST_2703';
using {ZMM_SBC_2903 as db} from '../db/zmara_schema';

/* SALES ORDER */
service SO_Headertable @(path:'/so-headertable') {
    entity So_Orderstable as projection on headertable;
}


/* SALES ITEM */
service SO_Itemtable @(path:'/so-itemtable') {
    entity So_Itemstables as projection on Itemtable;
}


/* CUSTOMER */
service C_customer @(path:'/c-customer') {
    entity Customer as projection on customertable;
}


/* PURCHASE HEADER */
service PoTable @(path:'/po-table') {
    entity po_headertable as projection on purchasetable;
}


/* PURCHASE ITEM */
service PoItem @(path:'/po-item') {
    entity po_itemtable as projection on purchaseitemtable;
}


/* VENDOR */
service vendorService @(path:'/vendor') {
    entity VendorMaster as projection on vendortable;
}
service MaterialMasterService {

    //Change Transaction (CT_ZMARA).
    //Full Create,Read,Update and Delete allowed
    @cds.redirection.target   // ← ADD THIS ONE LINE – tells CAP "this is the main ZMARA"
    entity ZMARA as projection on db.ZMARA;
    entity ZMARC as projection on db.ZMARC;
    @cds.redirection.target   // ← ADD THIS ONE LINE – tells CAP "this is the main ZMARD"
    entity ZMARD as projection on db.ZMARD;
    entity ZMAKTX as  projection on db.ZMAKTX;

    //Display Transaction (DT_ZMARA).
    //Read only no change allowed.
    
    @readonly
    entity ZMARA_Display as projection on db.ZMARA;

    @readonly
    entity ZMARD_Display as projection on db.ZMARD;
}