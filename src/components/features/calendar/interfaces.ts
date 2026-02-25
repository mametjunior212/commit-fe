import type { TEventColor } from "@/components/features/calendar/types";

export interface IUser {
	id: string;
	name: string;
	picturePath: string | null;
}

export interface IEvent {
	id: string;
	uuid: number;
	startDate: string;
	endDate: string;
	title: string;
	color: string;
	description: string;
	user?: {
		id: string;
		name: string;
		picturePath: string | null;
	};
}

export interface ICalendarCell {
	day: number;
	currentMonth: boolean;
	date: Date;
}
