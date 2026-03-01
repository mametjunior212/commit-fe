import { COLORS } from "./constants";

export const getEvents = async () => {
	// return CALENDAR_ITEMS_MOCK;
	return [];
	// return [
	// 	{
	// 		id: "1",
	// 		uuid: 1,
	// 		startDate: "2026-02-20T06:31:33.338Z",
	// 		endDate: "2026-02-20T07:31:33.338Z",
	// 		title: "Totle",
	// 		color: "blue",
	// 		description:
	// 			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",

	// 	},
	// 	{
	// 		id: "2",
	// 		uuid: 2,
	// 		startDate: "2026-02-20T06:31:33.338Z",
	// 		endDate: "2026-02-20T07:31:33.338Z",
	// 		title: "Totle",
	// 		color: "purple",
	// 		description:
	// 			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
	// 		user: {
	// 			id: "f3b035ac-49f7-4e92-a715-35680bf63175",
	// 			name: "Michael Doe",
	// 			picturePath: null,
	// 		},
	// 	},
	// 	{
	// 		id: "3",
	// 		uuid: 3,
	// 		startDate: "2026-02-20T06:31:33.338Z",
	// 		endDate: "2026-02-20T07:31:33.338Z",
	// 		title: "Totle",
	// 		color: COLORS[2],
	// 		description:
	// 			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
	// 		user: {
	// 			id: "f3b035ac-49f7-4e92-a715-35680bf63175",
	// 			name: "Michael Doe",
	// 			picturePath: null,
	// 		},
	// 	},
	// 	{
	// 		id: "4",
	// 		uuid: 4,
	// 		startDate: "2026-02-20T06:31:33.338Z",
	// 		endDate: "2026-02-20T07:31:33.338Z",
	// 		title: "Totle",
	// 		color: COLORS[3],
	// 		description:
	// 			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
	// 		user: {
	// 			id: "f3b035ac-49f7-4e92-a715-35680bf63175",
	// 			name: "Michael Doe",
	// 			picturePath: null,
	// 		},
	// 	},
	// 	{
	// 		id: "4",
	// 		uuid: 4,
	// 		startDate: "2026-02-20T06:31:33.338Z",
	// 		endDate: "2026-02-20T07:31:33.338Z",
	// 		title: "Totle",
	// 		color: COLORS[3],
	// 		description:
	// 			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
	// 		user: {
	// 			id: "f3b035ac-49f7-4e92-a715-35680bf63175",
	// 			name: "Michael Doe",
	// 			picturePath: null,
	// 		},
	// 	},
	// 	{
	// 		id: "5",
	// 		uuid: 5,
	// 		startDate: "2026-02-20T06:31:33.338Z",
	// 		endDate: "2026-02-20T07:31:33.338Z",
	// 		title: "Totle",
	// 		color: COLORS[3],
	// 		description:
	// 			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
	// 		user: {
	// 			id: "f3b035ac-49f7-4e92-a715-35680bf63175",
	// 			name: "Michael Doe",
	// 			picturePath: null,
	// 		},
	// 	},
	// 	{
	// 		id: "6",
	// 		uuid: 6,
	// 		startDate: "2026-02-20T06:31:33.338Z",
	// 		endDate: "2026-02-20T07:31:33.338Z",
	// 		title: "Totle",
	// 		color: COLORS[3],
	// 		description:
	// 			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
	// 		user: {
	// 			id: "f3b035ac-49f7-4e92-a715-35680bf63175",
	// 			name: "Michael Doe",
	// 			picturePath: null,
	// 		},
	// 	},
	// 	{
	// 		id: "7",
	// 		uuid: 7,
	// 		startDate: "2026-02-20T06:31:33.338Z",
	// 		endDate: "2026-02-20T07:31:33.338Z",
	// 		title: "Totle",
	// 		color: COLORS[3],
	// 		description:
	// 			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
	// 		user: {
	// 			id: "f3b035ac-49f7-4e92-a715-35680bf63175",
	// 			name: "Michael Doe",
	// 			picturePath: null,
	// 		},
	// 	},
	// 	{
	// 		id: "8",
	// 		uuid: 8,
	// 		startDate: "2026-02-20T06:31:33.338Z",
	// 		endDate: "2026-02-20T07:31:33.338Z",
	// 		title: "Totle",
	// 		color: COLORS[3],
	// 		description:
	// 			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
	// 		user: {
	// 			id: "f3b035ac-49f7-4e92-a715-35680bf63175",
	// 			name: "Michael Doe",
	// 			picturePath: null,
	// 		},
	// 	},
	// 	{
	// 		id: "9",
	// 		uuid: 9,
	// 		startDate: "2026-02-20T06:31:33.338Z",
	// 		endDate: "2026-02-20T07:31:33.338Z",
	// 		title: "Totle",
	// 		color: COLORS[3],
	// 		description:
	// 			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
	// 		user: {
	// 			id: "f3b035ac-49f7-4e92-a715-35680bf63175",
	// 			name: "Michael Doe",
	// 			picturePath: null,
	// 		},
	// 	},
	// 	{
	// 		id: "10",
	// 		uuid: 10,
	// 		startDate: "2026-02-20T06:31:33.338Z",
	// 		endDate: "2026-02-20T07:31:33.338Z",
	// 		title: "Totle",
	// 		color: COLORS[3],
	// 		description:
	// 			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
	// 		user: {
	// 			id: "f3b035ac-49f7-4e92-a715-35680bf63175",
	// 			name: "Michael Doe",
	// 			picturePath: null,
	// 		},
	// 	},
	// 	{
	// 		id: "11",
	// 		uuid: 11,
	// 		startDate: "2026-02-20T06:31:33.338Z",
	// 		endDate: "2026-02-20T07:31:33.338Z",
	// 		title: "Totle",
	// 		color: COLORS[3],
	// 		description:
	// 			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
	// 		user: {
	// 			id: "f3b035ac-49f7-4e92-a715-35680bf63175",
	// 			name: "Michael Doe",
	// 			picturePath: null,
	// 		},
	// 	},
	// 	{
	// 		id: "12",
	// 		uuid: 12,
	// 		startDate: "2026-02-20T06:31:33.338Z",
	// 		endDate: "2026-02-20T07:31:33.338Z",
	// 		title: "Totle",
	// 		color: COLORS[3],
	// 		description:
	// 			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
	// 		user: {
	// 			id: "f3b035ac-49f7-4e92-a715-35680bf63175",
	// 			name: "Michael Doe",
	// 			picturePath: null,
	// 		},
	// 	},
	// 	{
	// 		id: "13",
	// 		uuid: 13,
	// 		startDate: "2026-02-20T06:31:33.338Z",
	// 		endDate: "2026-02-20T07:31:33.338Z",
	// 		title: "Totle",
	// 		color: COLORS[3],
	// 		description:
	// 			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
	// 		user: {
	// 			id: "f3b035ac-49f7-4e92-a715-35680bf63175",
	// 			name: "Michael Doe",
	// 			picturePath: null,
	// 		},
	// 	},
	// 	{
	// 		id: "14",
	// 		uuid: 14,
	// 		startDate: "2026-02-02T06:31:33.338Z",
	// 		endDate: "2026-02-02T07:31:33.338Z",
	// 		title: "Totle",
	// 		color: "purple",
	// 		description:
	// 			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
	// 		user: {
	// 			id: "f3b035ac-49f7-4e92-a715-35680bf63175",
	// 			name: "Michael Doe",
	// 			picturePath: null,
	// 		},
	// 	},
	// 	{
	// 		id: "15",
	// 		uuid: 15,
	// 		startDate: "2026-02-02T06:31:33.338Z",
	// 		endDate: "2026-02-02T07:31:33.338Z",
	// 		title: "Totle",
	// 		color: "orange",
	// 		description:
	// 			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
	// 		user: {
	// 			id: "f3b035ac-49f7-4e92-a715-35680bf63175",
	// 			name: "Michael Doe",
	// 			picturePath: null,
	// 		},
	// 	},
	// 	{
	// 		id: "16",
	// 		uuid: 16,
	// 		startDate: "2026-02-02T08:31:33.338Z",
	// 		endDate: "2026-02-02T09:31:33.338Z",
	// 		title: "Totle",
	// 		color: "green",
	// 		description:
	// 			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
	// 		user: {
	// 			id: "f3b035ac-49f7-4e92-a715-35680bf63175",
	// 			name: "Michael Doe",
	// 			picturePath: null,
	// 		},
	// 	},
	// ]
};

export const getUsers = async () => {
	// return USERS_MOCK;
	return [];
};
