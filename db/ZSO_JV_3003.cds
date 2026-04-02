

namespace com.project.salesorder;

entity SOHeaderTable{
 @title : 'Sales Order Number'
 key VBELN: String;
 @title : 'Created Date'
 ERDAT: Date;
 @title : 'Customer Number'
 KUNNR: String;
 @title : 'Created By'
 ERNAM: String;
 
 // Composition (1 to many)
  Items : Composition of many SOItemTable
    on Items.VBELN = $self.VBELN;
}


entity SOItemTable{
 @title : 'Sales Order Number'
 key VBELN: String;
 @title : 'Item Number'
 POSNR: Integer;
 @title : 'Material Number'
 MATNR: String;
 @title : 'Material Group'
 MATKL: String;
 @title : 'Quantity'
 MENGE: Decimal;
 @title : 'Unit of Measure'
 MEINS: String;
 @title : 'Net Price'
 NETPR: String;
 @title : 'Pricing Unit'
 PEINH: Integer;

 // Back reference
  to_Header : Association to SOHeaderTable
    on to_Header.VBELN = $self.VBELN;

}


