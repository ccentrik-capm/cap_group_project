using { com.project.salesorder.SOHeaderTable as headertable } from '../db/ZSO_JV_3003';
using { com.project.salesorder.SOItemTable as Itemtable } from '../db/ZSO_JV_3003';
using { com.project.customer.Customer as customertable } from '../db/ZCM_PU_2703';
using { com.project.purchaseorder.PurchaseOrder as purchasetable } from '../db/ZMM_AP_2803';
using { com.project.purchaseorder.PurchaseOrderItem as purchaseitemtable } from '../db/ZMM_AP_2803';
using { com.project.vendormaster.VendorMaster as vendortable } from '../db/ZVM_ST_2703';
using { com.project.material.ZMARA as mat1 } from '../db/ZMM_AR_2703';
using { com.project.material.ZMARC as mat2 } from '../db/ZMM_AR_2703';


service SO_Headertable {
    entity So_Orderstable as projection on headertable;

}
service SO_Itemtable {
    entity So_Itemstables as projection on Itemtable;

}
service C_customer {
    entity Customer as projection on customertable;

}
service PoTable {
    entity po_headertable as projection on purchasetable;

}
service PoItem {
    entity po_itemtable as projection on purchaseitemtable;

}

service vendorService {
    entity VendorMaster as projection on vendortable;

}
service MaterialService1 {
    entity mara as projection on mat1;

}

service Materialservice2 {
    entity marc as projection on mat2;

}

