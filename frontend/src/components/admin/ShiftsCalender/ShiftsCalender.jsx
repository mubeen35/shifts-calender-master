import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Modal } from "antd";
import CustomeEvents from "./components/customEvents/CustomeEvents";
import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import dayGridPlugin from "@fullcalendar/daygrid";
import axios from "axios";
moment.locale("ko", {
  week: {
    dow: 1,
    doy: 1,
  },
});
const localizer = momentLocalizer(moment);

const ShiftsCalender = () => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState([]);
  const [events, setEvents] = useState([]);
  const [assign, setAssign] = useState("");
  const [shiftType, setShiftType] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [users, setUsers] = useState([]);
  

  const custEvents = [
    {
      end: "2020-09-10",
      start: "2020-09-10",
      title: "Something",
    },
    {
      end: "2020-09-30",
      start: "2020-09-10",
      title: "Something",
      color: "#1db847", // override!
    },
    {
      end: "2020-09-30",
      start: "2020-09-10",
      title: "Something",
      color: "#b8b31d", // override!
    },
    {
      end: "2020-09-10",
      start: "2020-09-10",
      title: "Something",
      color: "#b81d1d", // override!
    },
    {
      end: "2020-09-30",
      start: "2020-09-10",
      title: "Something",
      color: "#b81db3", // override!
    },
    {
      end: "2020-09-10",
      start: "2020-09-30",
      title: "Something",
    },
    {
      end: "2020-09-20",
      start: "2020-09-10",
      title: "Something",
    },
    {
      end: "2020-09-20",
      start: "2020-09-10",
      title: "Something",
      color: "#1db847", // override!
    },
    {
      end: "2020-09-10",
      start: "2020-09-10",
      title: "Something",
      color: "#b81d1d", // override!
    },
    {
      end: "2020-09-10",
      start: "2020-09-10",
      title: "Something",
    },
    {
      end: "2020-09-10",
      start: "2020-09-10",
      title: "Something",
    },
    {
      end: "2020-09-10",
      start: "2020-09-10",
      title: "Something",
      color: "#b8b31d", // override!
    },
    {
      end: "2020-09-10",
      start: "2020-09-10",
      title: "Something",
    },
    {
      end: "2020-09-10",
      start: "2020-09-10",
      title: "Something",
      color: "#b81d1d", // override!
    },
    {
      end: "2020-09-10",
      start: "2020-09-10",
      title: "Something",
      color: "#b81db3", // override!
    },
    {
      end: "2020-09-10",
      start: "2020-09-10",
      title: "Something",
    },
  ];

  const showModal = () => {
    setVisible(true);
  };
  const handelAssign = (e) => {
    e.preventDefault();
    setAssign(e.target.value);
  };
  const handelShift = (e) => {
    setShiftType(e.target.value);
  };
  const handelDate = (e) => {
    setStart(e.target.value);
    setEnd(e.target.value);
  };
  const handelEndDate = (e) => {
    setEnd(e.target.value);
  };

  const handleOk = (e) => {
    setVisible(false);
    const userId = assign;
    // const title = shiftType;
    // let color = "";
    let shiftTypeId = "";
    var swapable = "true";
    // let priority = "";

    // for (let i = 0; i < data.length; i++) {
    //   if (shiftType === data[i].shiftname) {
    //     priority = data[i].priority;
    //     break;
    //   }
    // }

    for (let i = 0; i < data.length; i++) {
      if (shiftType === data[i].shiftname) {
        shiftTypeId = data[i]._id;
        break;
      }
    }

    // for (let i = 0; i < data.length; i++) {
    //   if (shiftType === data[i].shiftname) {
    //     color = data[i].color;
    //     break;
    //   }
    // }
    
    const options = {
      url: "http://localhost:4000/api/shift/createShift",
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      data: {
        
        start: start,
        userId: userId,
        end: end,
        shiftTypeId: shiftTypeId,
        swapable: swapable,

      },
    };
    axios(options).then((res) => {
      alert("Shift Created Successfully");
    });
  };
  const handleCancel = (e) => {
    setVisible(false);
  };
  const handleDoctors = (e) => {
    if(e.target.value === "All"){
      axios.get("http://localhost:4000/api/shift/currentShifts").then((res) => {
        setEvents(res.data.shifts);
      });
    }else{
      axios.get("http://localhost:4000/api/shift/getUserByName/"+e.target.value).then((res) => {
      setEvents(res.data.shifts);
    });
        
    }
  }

 
  useEffect(() => {
    axios.get("http://localhost:4000/api/shift/currentShifts").then((res) => {
      console.log('Admin data gotten is:')  
      console.log(res.data.shifts);
      setEvents(res.data.shifts);
    });
    const options = {
      url: "http://localhost:4000/api/shift/getshifts",
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
    };
    axios(options).then((res) => {
      setData(res.data);
    });

    axios.get("http://localhost:4000/api/user/getusers").then((res) => {
      setUsers(res.data);
    });
  }, []);

  const cutomEvent = () => {
    return (
      <div style={{ backgroundColor: "red" }}>
        <p>{events.title}</p>
      </div>
    );
  };
  return (
    <div className="m-sm-4 m-2">
        <div className="col-3">
        <select
          id="selectDoctor"
          name="cars"
          className="custom-select bg-light m-2 shadow-sm"
          onChange={handleDoctors}
        >
          <option defaultValue="All">
           All
          </option>
          {users.map((dat) => (
            <option value={dat._id} key={dat._id}>
              {dat.firstName+' '+dat.lastName}
            </option>
          ))}
          </select>
        </div>
        <br/>
      <FullCalendar
        defaultView="dayGridMonth"
        plugins={[dayGridPlugin, interactionPlugin]}
        weekNumberCalculation = 'ISO'
        dateClick={showModal}
        eventOrder="priority"
        // eventClick={handelModal}
        events={events}
      />
      {/* <Calendar
        selectable
        localizer={localizer}
        onSelectSlot={showModal}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={Views.MONTH}
        views={{ month: true, week: true }}
        style={{ minHeight: '300vh' }}
        components={{
          event: CustomeEvents,
        }}
      /> */}

      <Modal
        title="Create Shift"
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <select
          id="cars"
          name="cars"
          className="custom-select bg-light m-2 shadow-sm"
          onChange={handelAssign}
        >
          <option defaultValue="Doctor Assigned" id="assi">
            Doctor Assigned
          </option>
          {users.map((dat) => (
            <option value={dat._id} key={dat._id}>
              {dat.firstName+' '+dat.lastName}
            </option>
          ))}
        </select>
        <select
          id="cars"
          name="cars"
          className="custom-select bg-light m-2 shadow-sm"
          onChange={handelShift}
        >
          <option defaultValue="Shift Type " id="shType">
            Shift Type
          </option>
          {data.map((sh) => (
            <option value={sh.shiftname} key={sh._id}>
              {sh.shiftname}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="form-control m-2 bg-light shadow-sm"
          placeholder="Start Date"
          onChange={handelDate}
        />
        <input
          type="date"
          className="form-control m-2 bg-light shadow-sm"
          placeholder="End Date"
          onChange={handelEndDate}
          defaultValue= {start}
        />
      </Modal>
    </div>
  );
};

export default ShiftsCalender;

/*

*/