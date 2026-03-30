namespace com.project.material;


entity ZMARA {
   key MATNR : String(18);      // Material Number
       MTART : String(4);       // Material Type
       MBRSH : String(1);       // Industry Sector
       LAEDA : Date;            // Last Change Date (Date type in CAP)
       PSTAT : String(15);      // Maintenance Status
       MATKL : String(9);       // Material Group

     //Cardinality: ZMARA (1) ────> ZMARC (N).
       //So one material can be in many plants.
       toZMARC : Association to many ZMARC on toZMARC.MATNR = $self.MATNR;
}
entity ZMARC{

   key MATNR : String(20); //FK-->ZMARA.MATNR.
   key WERKS : String(4);  //Plant Code (eg. 201,202, etc..).
       MMSTA : String(1);  //Plant Status : W=Working, B=Broken.

//FK back-reference to ZMARA
   
   toZMARA : Association to ZMARA on toZMARA.MATNR = MATNR;

}