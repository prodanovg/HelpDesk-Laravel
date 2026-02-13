import { useEffect, useState } from "react";
import api from "../lib/axios";

type Ticket = {
    id: number;
    title: string;
};

export default function Tickets() {
    const [tickets, setTickets] = useState<Ticket[]>([]);

    useEffect(() => {
        api.get("/tickets")
            .then((res) => {
                setTickets(res.data);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    return (
        <div>
            <h2>Tickets</h2>

            <ul>
                {tickets.map((ticket) => (
                    <li key={ticket.id}>{ticket.title}</li>
                ))}
            </ul>
        </div>
    );
}
