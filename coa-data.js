/* Technical values read from the Givaudan COA scans supplied by Trivenkem.
   Only values printed on the COA are filled. Blank = not stated on the COA.
   Dosage, tenacity and IFRA status are not on these COAs, so they stay blank.
   Customer name and company name are deliberately not included. */
(function(){
var STORE='Dry, well ventilated, preferably full, hermetically sealed. Ambient 10-30 C (50-85 F). Protect against light.';
var C=function(flash,batch,mfg,bb,coa,ph){return {flash:flash,lot:batch,mfg:mfg,bestBefore:bb,coa:coa||'',ph:ph||'',stability:'Storage (from COA): '+STORE,origin:'India'}};
window.COA_DATA={
 'Blue Star':C('84 C (183 F)','JI00331009','27 Oct 2026','27 Oct 2027','29 Oct 2026'),
 'Jasmine Gold':C('91 C (196 F)','JI00331005','28 Oct 2026','28 Oct 2027','29 Oct 2026'),
 'Aqua Mermaid':C('70 C (158 F)','JI00328290','29 Sep 2026','22 Mar 2028','28 Oct 2026'),
 'Moroccan Lavender':C('91 C (196 F)','JI00330614','23 Oct 2026','23 Oct 2027','28 Oct 2026'),
 'Summer Shimmer':C('80 C (176 F)','JI00329093','15 Oct 2026','15 Oct 2027','27 Oct 2026'),
 'Sunny Lemon':C('60 C (140 F)','JI00330226','22 Oct 2026','14 Apr 2028','27 Oct 2026'),
 'Citron Punch':C('60 C (140 F)','JI00330518','24 Oct 2026','16 Apr 2028','26 Oct 2026'),
 'UCB 1003B IN':C('54 C (129 F)','JI00330580','23 Oct 2026','15 Apr 2028',''),
 'Juicy Shower':C('81 C (178 F)','JI00330105','15 Oct 2026','15 Oct 2027',''),
 'Lemon Punch':C('71 C (160 F)','JI00330039','15 Oct 2026','15 Oct 2027','22 Oct 2026'),
 'Fruity Blossoms':C('78 C (172 F)','JI00330038','21 Oct 2026','21 Oct 2027',''),
 'Green Garden':C('82 C (180 F)','JI00330049','21 Oct 2026','21 Oct 2027',''),
 'Papaya Star (NC)':C('94 C (201 F)','JI00329375','09 Oct 2026','01 Apr 2028',''),
 'Pink Serenity':C('98 C (208 F)','JI00329593','09 Oct 2026','09 Oct 2027','14 Oct 2026'),
 'Zarah':C('84 C (183 F)','JI00329574','10 Oct 2026','10 Oct 2027',''),
 'Star Blossom':C('101 C (214 F)','JI00329584','10 Oct 2026','10 Oct 2027',''),
 'Lavender Charm':C('100 C (212 F)','JI00329080','07 Oct 2026','07 Oct 2027','12 Oct 2026'),
 'Sunshine Flower':C('86 C (187 F)','JI00328637','06 Oct 2026','06 Oct 2027','08 Oct 2026'),
 'Tropical Fresh':C('60 C (140 F)','JI00328491','01 Oct 2026','24 Mar 2028',''),
 'Desire Sea':C('73 C (163 F)','JI00328291','30 Sep 2026','30 Sep 2027',''),
 'Pink Fantasy':C('100 C (212 F)','JI00327775','25 Sep 2026','25 Sep 2027','29 Sep 2026'),
 'Brazilian Orange':C('58 C (136 F)','JI00326108','11 Sep 2026','04 Mar 2028',''),
 'Challenger':C('65 C (149 F)','JI00326093','10 Sep 2026','10 Sep 2027','16 Sep 2026'),
 'KS Fruit MX Mod':C('96 C (205 F)','JI00326516','12 Sep 2026','12 Sep 2027',''),
 'Lavender Twist':C('83 C (181 F)','JI00323805','19 Aug 2026','10 Feb 2028',''),
 'Misty Mango':C('Above 100 C (212 F)','JI00323529','13 Aug 2026','04 Feb 2028','17 Aug 2026'),
 'Mysore Connect':C('100 C (212 F)','JI00322123','29 Jul 2026','29 Jul 2027',''),
 'Sky 09':C('91 C (196 F)','JI00325234','01 Sep 2026','23 Feb 2028',''),
 'Blue Desire':C('98 C (208 F)','JI00331016','27 Oct 2026','27 Oct 2027','28 Oct 2026'),
 'Rose Ivy':C('88 C (190 F)','JI00318717','26 Jun 2026','26 Jun 2027',''),
 'Mercy Caps':C('Above 94 C (201 F)','VE00990574','27 Feb 2026','21 Aug 2027','','6.0 (spec 6.7 or below)')
};
/* Not attached to any app fragrance because the names differ:
   COA "Red Saffron IMP 1" (app has "Red Saffron IMP 2"): flash 100 C (above 212 F), batch JI00328882, mfg 06 Oct 2026, best before 29 Mar 2028.
   COA "FWC 1030" (app has "FWC 1028 IND"): flash 73 C (163 F), batch JI00322112, mfg 31 Jul 2026, best before 31 Jul 2027.
*/
})();
