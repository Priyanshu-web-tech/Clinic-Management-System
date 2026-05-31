const httpStatus = require("http-status").status;
const dashboardRepository = require("../repositories/dashboardRepository");
const { buildTrendRange } = require("../utils/helper");
const {
  userType: userTypeConst,
  designation: designationConst,
  visitStatus: visitStatusConst,
} = require("../constant/constant");

const getStats = async (req) => {
  try {
    const currentUser = req.data;
    const hospitalId = currentUser.hospital?._id;

    if (!hospitalId) {
      return {
        error: true,
        data: {},
        msgCode: "HOSPITAL_NOT_FOUND",
        status: httpStatus.BAD_REQUEST,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateRange = { $gte: today, $lt: tomorrow };

    const isChemist =
      currentUser.userType === userTypeConst.STAFF &&
      currentUser.designation === designationConst.CHEMIST;
    const isDoctor = currentUser.userType === userTypeConst.DOCTOR;

    const trendRange = buildTrendRange(7);

    const [visitCounts, totalPatients, todayPrescriptions, totalPrescriptions, totalStaff, rawTrend] =
      await Promise.all([
        isChemist
          ? Promise.resolve({})
          : dashboardRepository.getVisitCounts({
              hospitalId,
              doctorId: isDoctor ? currentUser._id : null,
              dateRange,
              statuses: [
                visitStatusConst.WAITING,
                visitStatusConst.IN_CONSULTATION,
                visitStatusConst.COMPLETED,
                visitStatusConst.CANCELLED,
              ],
            }),
        dashboardRepository.getTotalPatients(hospitalId),
        dashboardRepository.getPrescriptionCount(hospitalId, dateRange),
        isChemist
          ? dashboardRepository.getTotalPrescriptions(hospitalId)
          : Promise.resolve(0),
        isDoctor
          ? dashboardRepository.getTotalStaff(hospitalId, userTypeConst.STAFF)
          : Promise.resolve(0),
        isChemist
          ? Promise.resolve([])
          : dashboardRepository.getVisitTrend({
              hospitalId,
              doctorId: isDoctor ? currentUser._id : null,
              start: trendRange.start,
              end: trendRange.end,
            }),
      ]);

    const visitTrend = isChemist ? [] : rawTrend;

    return {
      error: false,
      data: {
        waitingVisits: visitCounts[visitStatusConst.WAITING] ?? 0,
        inConsultationVisits: visitCounts[visitStatusConst.IN_CONSULTATION] ?? 0,
        completedVisits: visitCounts[visitStatusConst.COMPLETED] ?? 0,
        cancelledVisits: visitCounts[visitStatusConst.CANCELLED] ?? 0,
        totalPatients,
        todayPrescriptions,
        totalPrescriptions,
        totalStaff,
        visitTrend,
      },
      msgCode: "STATS_FETCHED",
      status: httpStatus.OK,
    };
  } catch (err) {
    console.log(err);
    return {
      error: true,
      data: {},
      msgCode: "INTERNAL_SERVER_ERROR",
      status: httpStatus.INTERNAL_SERVER_ERROR,
    };
  }
};

module.exports = { getStats };
