interface AttendeeTypes {
    id: number;
    name: string;
    email: string;
    phone: string;
    event_id: number;
    status:"registered"|"checked-in"|"cancelled";
    ticket_type:string;
}

export const ATTENDEE_DATA: AttendeeTypes[] = [
    {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "123-456-7890",
        event_id: 101,
        status: "registered",
        ticket_type: "VIP"
    },
    {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "987-654-3210",
        event_id: 102,
        status: "checked-in",
        ticket_type: "General"
    },
    {
        id: 3,
        name: "Alice Johnson",
        email: "alice.johnson@example.com",
        phone: "555-123-4567",
        event_id: 103,
        status: "cancelled",
        ticket_type: "VIP"
    },
    {
        id: 4,
        name: "Bob Brown",
        email: "bob.brown@example.com",
        phone: "444-987-6543",
        event_id: 104,
        status: "registered",
        ticket_type: "General"
    },
    {
        id: 5,
        name: "Charlie Davis",
        email: "charlie.davis@example.com",
        phone: "333-222-1111",
        event_id: 105,
        status: "checked-in",
        ticket_type: "VIP"
    },
    {
        id: 6,
        name: "Diana Evans",
        email: "diana.evans@example.com",
        phone: "222-333-4444",
        event_id: 106,
        status: "registered",
        ticket_type: "General"
    },
    {
        id: 7,
        name: "Ethan Foster",
        email: "ethan.foster@example.com",
        phone: "111-222-3333",
        event_id: 107,
        status: "cancelled",
        ticket_type: "VIP"
    },
    {
        id: 8,
        name: "Fiona Green",
        email: "fiona.green@example.com",
        phone: "666-777-8888",
        event_id: 108,
        status: "checked-in",
        ticket_type: "General"
    },
    {
        id: 9,
        name: "George Harris",
        email: "george.harris@example.com",
        phone: "999-888-7777",
        event_id: 109,
        status: "registered",
        ticket_type: "VIP"
    },
    {
        id: 10,
        name: "Hannah Irving",
        email: "hannah.irving@example.com",
        phone: "888-999-0000",
        event_id: 110,
        status: "checked-in",
        ticket_type: "General"
    },
    {
        id: 11,
        name: "Ian Jacobs",
        email: "ian.jacobs@example.com",
        phone: "777-666-5555",
        event_id: 111,
        status: "registered",
        ticket_type: "VIP"
    },
    {
        id: 12,
        name: "Jessica King",
        email: "jessica.king@example.com",
        phone: "555-444-3333",
        event_id: 112,
        status: "checked-in",
        ticket_type: "General"
    },
    {
        id: 13,
        name: "Kevin Lewis",
        email: "kevin.lewis@example.com",
        phone: "444-333-2222",
        event_id: 113,
        status: "cancelled",
        ticket_type: "VIP"
    },
    {
        id: 14,
        name: "Laura Martinez",
        email: "laura.martinez@example.com",
        phone: "333-222-1111",
        event_id: 114,
        status: "registered",
        ticket_type: "General"
    },
    {
        id: 15,
        name: "Michael Nelson",
        email: "michael.nelson@example.com",
        phone: "222-111-0000",
        event_id: 115,
        status: "checked-in",
        ticket_type: "VIP"
    }
];