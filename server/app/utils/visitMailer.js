const { sendEmail, emailTypeSubject } = require("./mailer");

const sendVisitSummaryEmail = (visit, medicines) => {
  const patient = visit.patient;
  if (!patient?.email) return;

  const fullName = [patient.firstName, patient.lastName].filter(Boolean).join(" ");
  const doctorName = [visit.doctor?.firstName, visit.doctor?.lastName].filter(Boolean).join(" ");

  const visitDate = new Date(visit.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const medicinesRows = medicines
    .map((m, i) => {
      const freq = `${m.frequency?.morning ?? 0}–${m.frequency?.afternoon ?? 0}–${m.frequency?.night ?? 0}`;
      const duration = `${m.durationValue ?? 1} ${m.durationUnit ?? "Days"}`;
      const timing = m.timing
        ? m.timing.charAt(0).toUpperCase() + m.timing.slice(1).replace(/_/g, " ")
        : "Anytime";
      const rowBg = i % 2 === 1 ? "#fafafa" : "#ffffff";
      return `<tr style="background: ${rowBg}; border-bottom: 1px solid #e4e4e7;">
        <td style="font-size: 13px; color: #18181b; padding: 10px 14px; vertical-align: middle;">${m.medicineName}</td>
        <td style="padding: 10px 14px; vertical-align: middle;"><span style="display: inline-block; background: #e4e4e7; border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 700; color: #3f3f46; letter-spacing: 0.5px; font-family: monospace;">${freq}</span></td>
        <td style="font-size: 13px; color: #18181b; padding: 10px 14px; vertical-align: middle; white-space: nowrap;">${duration}</td>
        <td class="med-timing" style="font-size: 11px; color: #71717a; padding: 10px 14px; vertical-align: middle;">${timing}</td>
      </tr>`;
    })
    .join("");

  const symptoms = visit.symptoms?.trim() || "";
  const diagnosis = visit.diagnosis?.trim() || "";

  const followUpSection = visit.followUpDate
    ? `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 14px 18px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size: 20px; padding-right: 12px; vertical-align: middle;">&#128197;</td>
                <td style="vertical-align: middle;">
                  <p style="font-size: 12px; color: #15803d; font-weight: 600; margin-bottom: 3px;">Follow-up appointment</p>
                  <p style="font-size: 15px; color: #166534; font-weight: 700;">${new Date(visit.followUpDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`
    : "";

  const data = {
    patientName: fullName,
    patientCode: patient.patientCode,
    doctorName,
    visitNumber: visit.visitNumber,
    tokenNumber: visit.tokenNumber,
    visitDate,
    symptoms: symptoms || "Not recorded",
    symptomsColor: symptoms ? "#3f3f46" : "#a1a1aa",
    symptomsStyle: symptoms ? "normal" : "italic",
    diagnosis: diagnosis || "Not recorded",
    diagnosisColor: diagnosis ? "#3f3f46" : "#a1a1aa",
    diagnosisStyle: diagnosis ? "normal" : "italic",
    medicinesRows,
    followUpSection,
  };

  sendEmail(patient.email, data, emailTypeSubject.VISIT_SUMMARY).catch((err) =>
    console.error("Visit summary email failed:", err)
  );
};

module.exports = { sendVisitSummaryEmail };
