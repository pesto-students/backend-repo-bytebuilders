const AttendanceModel = require("../../models/attendanceModel");
const HolidayModel = require("../../models/holidayModel");
const LeaveModel = require("../../models/leaveModel"); 

const punchIn = async (req, res) => {
    const user = req.user;
    const { current_time, current_date } = getCurrentTimeAndDate();

    try {
        let attendanceRecord = await AttendanceModel.findOne({ user: user._id, date: current_date });
        let punchTimes = attendanceRecord ? attendanceRecord.punch_times : [];

        if (punchTimes.length % 2 !== 0) {
            return res.status(400).json({ message: "You must punch out before punching in again" });
        }
        
        if (punchTimes.length >= 24) {
            return res.status(400).json({ message: "Limit Exceeded. You have already punched in and out 12 times today" });
        }

        punchTimes.push(formatTime(current_time));
        if (attendanceRecord) {
            attendanceRecord.punch_times = punchTimes;
            await attendanceRecord.save();
        } else {
            attendanceRecord = await AttendanceModel.create({
                user: user._id,
                date: current_date,
                punch_times: [formatTime(current_time)],
                first_punch_in: current_time
            });
        }
        
        return res.status(201).json({
            message: "Punch-in recorded successfully",
            initialPuchedInAt: attendanceRecord.first_punch_in,
            punch_in_time: formatTime(current_time),
            totalPunchTIme: attendanceRecord.total_punch_time,
            date: current_date,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


const punchOut = async (req, res) => {
    const user = req.user;
    const { current_time, current_date } = getCurrentTimeAndDate();
    let totalPunchTime = 0; // Declare totalPunchTime here

    try {
        let attendanceRecord = await AttendanceModel.findOne({ user: user._id, date: current_date });
        let punchTimes = attendanceRecord ? attendanceRecord.punch_times : [];

        if (punchTimes.length % 2 !== 1) {
            return res.status(400).json({ message: "You must punch in before punching out" });
        }
        
        if (punchTimes.length >= 24) {
            return res.status(400).json({ message: "Limit Exceeded. You have already punched in and out 12 times today" });
        }

        punchTimes.push(formatTime(current_time));
        if (attendanceRecord) {
            attendanceRecord.punch_times = punchTimes;

            // Total Punch time
            for (let i = 0; i < punchTimes.length; i += 2) {
                const punchInTime = parseTime(punchTimes[i]);
                const punchOutTime = parseTime(punchTimes[i + 1]);
                const punchDuration = punchOutTime - punchInTime;
                totalPunchTime += punchDuration;
            }
            attendanceRecord.total_punch_time = totalPunchTime;
            attendanceRecord.last_punchout = punchTimes[punchTimes.length - 1];
            await attendanceRecord.save();
        }
        
        return res.status(201).json({
            message: "Punch-out recorded successfully",
            date: current_date,
            punch_out_time: formatTime(current_time),
            lastPunchOut: punchTimes[punchTimes.length - 1],
            total_punch_time: totalPunchTime.toString()
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const getPunchData = async (req, res) => {
    const user = req.user;
    const { current_time, current_date } = getCurrentTimeAndDate();

    try {
        let attendanceRecord = await AttendanceModel.findOne({ user: user._id, date: current_date });

        const holiday = await HolidayModel.findOne({ date: current_date });
        const isHoliday = !!holiday;

        const dayOfWeek = current_time.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        const leave = await LeaveModel.findOne({
            user: user._id,
            start_date: { $lte: current_time },
            end_date: { $gte: current_time },
            leave_status: { $in: ['approved', 'pending'] }
        });
        const isOnLeave = !!leave;

        if (!attendanceRecord) {
            const punchData = {
                userId: user._id,
                date: current_date,
                punchTimes: [],
                netHourInOffice: "0:00",
                isHoliday: isHoliday,
                isWeekend: isWeekend,
                isOnLeave: isOnLeave
            };
            return res.status(200).json(punchData);
        }

        const punchTimes = attendanceRecord.punch_times;
        const punchData = {
            userId: user._id,
            date: current_date,
            punchTimes: punchTimes,
            netHourInOffice: formatNetHour(attendanceRecord.total_punch_time),
            isHoliday: isHoliday,
            isWeekend: isWeekend,
            isOnLeave: isOnLeave
        };

        return res.status(200).json(punchData);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


const getCurrentTimeAndDate = () => {
    const now = new Date();
    // Convert UTC time to IST (UTC+5:30)
    const ISTOffset = 330 * 60 * 1000;
    const ISTTime = new Date(now.getTime() + ISTOffset);
    return {
        current_time: ISTTime,
        current_date: ISTTime.toISOString().split('T')[0]
    };
};

const formatTime = (time) => {
    return `${time.toISOString().split('T')[1].slice(0, 8)}`;
};

const parseTime = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
};

const formatNetHour = (totalPunchTimeInSeconds) => {
    const hours = Math.floor(totalPunchTimeInSeconds / 3600);
    const minutes = Math.floor((totalPunchTimeInSeconds % 3600) / 60);
    return `${hours}:${minutes}`;
};

module.exports = { 
    punchIn,
    punchOut,
    getPunchData
};
