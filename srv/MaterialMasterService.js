
const cds = require('@sap/cds');

module.exports = cds.service.impl(async function (srv) {

    const { ZMARA, ZMARC, ZMARD } = srv.entities;

    // ── Allowed value lists ──────────────────────────────
    const VALID = {
        MTART : ['S', 'L', 'G'],
        MBRSH : ['MN', 'PH', 'IN', 'HM', 'MK'],
        MATKL : ['PL', 'IR', 'EL', 'OT', 'MD'],
        PSTAT : ['R', 'U', 'S'],
        MMSTA : ['W', 'B'],
    };

    // ── HELPER: validate one field ───────────────────────
    // Uses req.reject() so it STOPS execution immediately
   function validateField(req, value, validList, fieldName, fieldMeaning) {
    console.log(`Checking ${fieldName}: '${value}' against ${validList}`); // ← ADD THIS
    if (value && !validList.includes(value)) {
        req.reject(400,
            `Invalid ${fieldName}: '${value}'. Allowed values: ${validList.join(', ')} (${fieldMeaning})`
        );
    }
}

    // ════════════════════════════════════════════════════════
    // ZMARA – BEFORE CREATE
    // ════════════════════════════════════════════════════════
    srv.before('CREATE', ZMARA, async (req) => {
        const d = req.data;

        // 1. MATNR is mandatory
        if (!d.MATNR || d.MATNR.trim() === '') {
            req.reject(400, 'MATNR (Material Number) is required and cannot be empty.');
        }

        // 2. Duplicate check — using string name, NOT entity variable
        const existing = await SELECT.one
            .from('ZMM_SBC_2903.ZMARA')
            .where({ MATNR: d.MATNR });

        if (existing) {
            req.reject(409,
                `Material '${d.MATNR}' already exists. Use UPDATE to change it.`
            );
        }

        // 3. Field validations
        validateField(req, d.MTART, VALID.MTART, 'MTART', 'S=SOLID L=LIQUID G=GAS');
        validateField(req, d.MBRSH, VALID.MBRSH, 'MBRSH', 'MN=MANUF PH=PHARMA IN=INDUSTRIAL HM=HOME MK=MEDICINE');
        validateField(req, d.MATKL, VALID.MATKL, 'MATKL', 'PL=PLASTICS IR=IRON EL=ELECTRICITY OT=OTHERS MD=MEDICINE');
        validateField(req, d.PSTAT, VALID.PSTAT, 'PSTAT', 'R=RAW U=USE S=SELL');
    });

    // ════════════════════════════════════════════════════════
    // ZMARA – BEFORE UPDATE
    // ════════════════════════════════════════════════════════
    srv.before('UPDATE', ZMARA, async (req) => {
        const d = req.data;
        validateField(req, d.MTART, VALID.MTART, 'MTART', 'S=SOLID L=LIQUID G=GAS');
        validateField(req, d.MBRSH, VALID.MBRSH, 'MBRSH', 'MN=MANUF PH=PHARMA IN=INDUSTRIAL HM=HOME MK=MEDICINE');
        validateField(req, d.MATKL, VALID.MATKL, 'MATKL', 'PL=PLASTICS IR=IRON EL=ELECTRICITY OT=OTHERS MD=MEDICINE');
        validateField(req, d.PSTAT, VALID.PSTAT, 'PSTAT', 'R=RAW U=USE S=SELL');
    });

    // ════════════════════════════════════════════════════════
    // ZMARA – AFTER CREATE: Auto-set LAEDA = today
    // FIX: result is an OBJECT on CREATE, use result.MATNR directly
    // ════════════════════════════════════════════════════════
    srv.after('CREATE', ZMARA, async (result, req) => {
        const today = new Date().toISOString().split('T')[0];

        // result is a single object after CREATE
        const matnr = result.MATNR;

        if (matnr) {
            // FIX: use string name, NOT entity variable
            await UPDATE('ZMM_SBC_2903.ZMARA')
                .set({ LAEDA: today })
                .where({ MATNR: matnr });

            console.log(`[ZMARA] Created - LAEDA auto-set to ${today} for MATNR: ${matnr}`);
        }
    });

    // ════════════════════════════════════════════════════════
    // ZMARA – AFTER UPDATE: Auto-set LAEDA = today
    // FIX: result is an array on UPDATE, use req.data.MATNR instead
    // ════════════════════════════════════════════════════════
    srv.after('UPDATE', ZMARA, async (result, req) => {
        const today = new Date().toISOString().split('T')[0];

        // result is an ARRAY after UPDATE, so get MATNR from req.data
        const matnr = req.data.MATNR;

        if (matnr) {
            await UPDATE('ZMM_SBC_2903.ZMARA')
                .set({ LAEDA: today })
                .where({ MATNR: matnr });

            console.log(`[ZMARA] Updated - LAEDA auto-set to ${today} for MATNR: ${matnr}`);
        }
    });

    // ════════════════════════════════════════════════════════
    // ZMARC – BEFORE CREATE
    // FIX: req.reject() instead of req.error(), string table name
    // ════════════════════════════════════════════════════════
    srv.before('CREATE', ZMARC, async (req) => {
        const d = req.data;

        // FK Check: MATNR must exist in ZMARA
        if (d.MATNR) {
            const parent = await SELECT.one
                .from('ZMM_SBC_2903.ZMARA')  // ← string, not variable
                .where({ MATNR: d.MATNR });

            if (!parent) {
                req.reject(404,                // ← reject, not error
                    `Cannot add ZMARC: Material '${d.MATNR}' does not exist in ZMARA. ` +
                    `Create the material in ZMARA first.`
                );
            }
        }

        // Validate MMSTA
        validateField(req, d.MMSTA, VALID.MMSTA, 'MMSTA', 'W=Working B=Broken');
    });

    // ════════════════════════════════════════════════════════
    // ZMARD – BEFORE CREATE
    // FIX: req.reject() instead of req.error(), string table name
    // ════════════════════════════════════════════════════════
    srv.before('CREATE', ZMARD, async (req) => {
        const d = req.data;

        // FK Check: MATNR must exist in ZMARA
        if (d.MATNR) {
            const parent = await SELECT.one
                .from('ZMM_SBC_2903.ZMARA')  // ← string, not variable
                .where({ MATNR: d.MATNR });

            if (!parent) {
                req.reject(404,                // ← reject, not error
                    `Cannot add ZMARD: Material '${d.MATNR}' does not exist in ZMARA. ` +
                    `Create the material in ZMARA first.`
                );
            }
        }
    });

    // ════════════════════════════════════════════════════════
    // DISPLAY TRANSACTION – Read handler
    // ════════════════════════════════════════════════════════
    srv.on('READ', 'ZMARA_Display', async (req) => {
        const results = await SELECT.from('ZMM_SBC_2903.ZMARA');
        console.log(`[D_ZMARA] Displayed ${results.length} material(s)`);
        return results;
    });

});

