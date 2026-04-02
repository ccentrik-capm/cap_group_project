namespace com.project.material;
entity ZMARA {
   @title : 'Material Number'
   key MATNR : String(18);      // Material Number
   @title : 'Material Type'
   MTART : String(4);       // Material Type
   @title : 'Industry Sector'
   MBRSH : String(1);       // Industry Sector
   @title : 'Last Change Date'
   LAEDA : Date;            // Last Change Date (Date type in CAP)
   @title : 'Maintenance Status'
   PSTAT : String(15);      // Maintenance Status
   @title : 'Material Group'
   MATKL : String(9);       // Material Group

     
       toZMARC : Association to many ZMARC on toZMARC.MATNR = $self.MATNR;
       toZMARD : Association to many ZMARD on toZMARD.MATNR = $self.MATNR;
       toZMAKTX : Association to many ZMAKTX on toZMAKTX.MATNR = $self.MATNR;
       toZMAT_STORAGE : Association to many ZMAT_STORAGE on toZMAT_STORAGE.MATNR = $self.MATNR;
}
entity ZMARC{
   @title : 'Material Number'
   key MATNR : String(20); //FK-->ZMARA.MATNR.
    @title : 'Plant Code'
   key WERKS : String(4);  //Plant Code (eg. 201,202, etc..).
    @title : 'Plant Status'
       MMSTA : String(1);  //Plant Status : W=Working, B=Broken.

//FK back-reference to ZMARA
   
   toZMARA : Association to ZMARA on toZMARA.MATNR = MATNR;

}
entity ZMARD {
   @title : 'Material Number'
    key MATNR : String(20);    // FK → ZMARA.MATNR
    @title : 'Plant Code'
    key WERKS : String(4);     // Plant Code
     @title : 'Storage Location'
    key LGORT : String(10);    // Storage Location (e.g. RM1, KRM1)

        // FK back-reference to ZMARA
        toZMARA : Association to ZMARA on toZMARA.MATNR = MATNR;
}
entity ZMAKTX {
    @title : 'Material Number'
    key MATNR : String(20);    // FK → ZMARA.MATNR
     @title : 'Language'
    key SPRAS : String(2);     // Language: EN=English
     @title : 'mDesc'
        MAKTX : String(100);   // Material Description (human-readable name)

        // FK back-reference to ZMARA
        toZMARA : Association to ZMARA on toZMARA.MATNR = MATNR;
}

entity ZMAT_STORAGE {
   @title : 'Material Number'
   key MATNR : String(18);    // FK → ZMARA.MATNR
   @title : 'Plant'
   key WERKS : String(4);     // Plant Code (e.g. 201, 202)
   @title : 'Storage Location'
   key LGORT : String(10);    // Storage Location (e.g. RM1, KRM1)
   @title : 'Quantity'
   MENGE : Decimal(13, 3);    // Stock Quantity
   @title : 'Unit of Measure'
   MEINS : String(3);         // Base Unit of Measure (e.g. KG, EA, L)
 // FK back-reference to ZMARA
   toZMARA : Association to ZMARA on toZMARA.MATNR = MATNR;
}