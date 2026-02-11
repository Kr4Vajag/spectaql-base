// `underlyingType` contains the actual GraphQL type (e.g., { name: "String", kind: "SCALAR" })
// `type` is the parent type object (e.g., PageInfo)
module.exports = function generateExample({ underlyingType, type, field, arg, inputField }) {
    const fieldOrArg = arg || inputField || field;
    const fieldName = fieldOrArg?.name;
    const typeName = underlyingType?.name;
    const parentName = type?.name;

    const fieldExamples = {
        // Pagination
        startCursor: "YXJyYXljb25uZWN0aW9uOjA=",
        cursor: "eyJpZCI6MTIzfQ==",
        endCursor: "dXNlcl8yNHo4cXA5",
        first: 20,
        last: 15,
        after: "eyJpZCI6MTAwfQ==",
        before: "zxJpABI6MjAwfW==",
        totalCount: 42,

        // Dates/times
        check_in: "2025-03-15T15:00:00Z",
        check_out: "2025-03-18T11:00:00Z",
        reservation_from: "2025-03-15",
        reservation_to: "2025-03-18",
        createdAt: "2025-01-10T09:00:00Z",
        updatedAt: "2025-01-12T14:30:00Z",
        cancelledAt: "2025-01-11T10:00:00Z",
        birthday: "1985-06-20",

        // Client fields
        firstname: "Max",
        lastname: "Mustermann",
        company: "Acme GmbH",
        companyAdditionalInformation: "Attn: Booking Dept",
        street: "Musterstraße 123",
        zipcode: "10115",
        city: "Berlin",
        country: "DE",
        nationality: "DE",
        language: "de",
        email: "guest@example.com",
        telephone: "+49 30 12345678",
        mobile: "+49 170 1234567",
        fax: "+49 30 12345679",
        passportNumber: "C01X00T47",
        idCardNumber: "L01X00F47",
        issuingAuthority: "Stadt Berlin",
        carPlateNumber: "B-AB 1234",

        // Room/Category
        name: "Double Room Superior",
        roomName: "312",
        areaName: "3rd Floor",
        description: "Spacious double room with city view",
        standardOccupancy: 2,
        minOccupancy: 1,
        maxOccupancy: 4,
        occupancy: 3,
        minimumRate: "89.00",
        availability: 5,

        // Reservation
        code: "RES-2025-001234",
        bookingChannelCode: "BDC-123456789",
        groupName: "Mustermann Family",
        notes: "Late arrival expected",
        guestMessage: "Welcome! Your room is ready.",
        mealNotes: "Vegetarian breakfast",
        maidNotes: "Extra pillows requested",
        stayPreferences: "High floor, quiet room",
        mealPreferences: "No shellfish",

        // Pricing
        lodgingsGross: "359.97",
        additionalSales: "30.00",
        packPriceGross: "149.99",
        packPriceNet: "109.24",
        lodgingGross: "99.99",
        lodgingNet: "84.03",

        // Statistics
        occupancy: 0.75,

        // Webhooks
        url: "https://api.example.com/webhooks/3rpms",
        secret: "whsec_abc123xyz789",
        events: ["reservation.created", "reservation.updated"],

        // Room Access
        pin: "1234",
        compartment: "A12",
        qrData: "ROOM312-2025031518-TOKEN",

        // URLs
        selfcheckinUrl: "https://hotel.3rpms.de/checkin/res_abc123",
        selfcheckout_url: "https://hotel.3rpms.de/checkout/xyz789def",
        pmsUrl: "https://hotel.3rpms.de/reservation/abc123",
        receiptUrl: "https://hotel.3rpms.de/receipt/abc123.pdf",
        receiptPdfUrl: "https://pos.example.com/receipts/12345.pdf",

        // External sales
        receiptNumber: "POS-2025-00001",
        waiterName: "Thomas",
        tableName: "Table 7",

        // Restrictions
        stopSell: false,
        minStay: 1,
        maxStay: 14,
        closedToArrival: false,
        closedToDeparture: false,
        guarantee: false,
        cancellation: 7,
        breakfastIncluded: true,

        // Misc
        countTowardsPerformance: true,
        selfcheckout_enabled: true,
        newsletterSubscriptionEnabled: true,
        birthdayGreetingsEnabled: true,
        deleted: true,
        created: true,
        hasNextPage: true,
        hasPreviousPage: false,
    };

    if (fieldName && fieldExamples[fieldName] !== undefined) {
        return fieldExamples[fieldName];
    }

    if (typeName === "ID" || fieldName === "id") {
        const prefixes = {
            RoomStay: "rs_",
            Reservation: "res_",
            Category: "cat_",
            RoomSetup: "room_",
            Client: "cli_",
            Person: "cli_",
            Company: "cli_",
            WebhookEndpoint: "wh_",
            PaymentMethod: "pm_",
            RoomAccessKey: "rak_",
            ExternalSalesProduct: "prod_",
            ClientTitle: "title_",
            PaymentTerms: "pt_",
            IncomingPayment: "pay_",
        };
        const prefix = prefixes[parentName] || "";

        return `${prefix}24z8qp9`;
    }

    if (typeName === "CleaningStatus") return "CLEAN";
    if (typeName === "WebhookEndpointStatus") return "ENABLED";
    if (typeName === "SelfcheckinStatus") return "AVAILABLE";
    if (typeName === "ReservationStatus") return "ACTIVE";

    if (typeName === "Date") {
        return "2025-03-15";
    }

    if (typeName === "Datetime") {
        return "2025-03-15T14:30:00Z";
    }

    if (typeName === "Boolean") {
        return true;
    }

    if (typeName === "Decimal") {
        if (fieldName === "gross") {
            return "389.97";
        }

        if (fieldName === "adr") {
            return "125.00";
        }

        if (fieldName === "revPAR") {
            return "93.75";
        }

        if (fieldName?.toLowerCase().includes("amount")) {
            return "129.99";
        }

        return "99.00";
    }

    return undefined;
};
