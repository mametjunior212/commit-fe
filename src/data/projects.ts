import { media2 } from '@/data/media';
import { partner } from '@/data/partner';


export interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  client: string;
  heroImage: string;
  herovideo: string;
  thumbnail: string;
  description: string;
  about: string;
  solution: string;
  results: string[];
  services: string[];
  gallery: { img: string, alt?: string, type: string, orderBy: number }[];
  nextProject: string;
  prevProject: string;
  template: string;
  startDate: string;
  endDate: string;
  color: string | "blue";
  keyTakeaways?: {
    title?: string,
    isi?: string,
  };
  partner?: {
    img: string,
    partner: string,
    link: string,
  }[];
  media?:
  {
    img: string;
    media: string;
    link: string;
  }[];
  user?: {
    id: string;
    name?: string;
    picturePath: string | null;
  }
  absen?: {
    uuid: string;
    user?: string | "";
    nama?: string | "";
    nomor?: string | "";
    pekerjaan_id?: string | "";
    alamat?: string | "";
    alamat_kantor?: string | "";
  };
}
export const projects: Project[] = [
  {
    id: 'TALK ABOUT IT RUIJIE REYEE',
    title: 'TALK ABOUT IT RUIJIE REYEE',
    category: 'Workshop',
    year: '24 MAY 2024',
    client: '',
    heroImage: "/assets/event1/BACKDROPasd2323we-2048x1062.jpg",
    thumbnail: "/assets/event1/BACKDROPasd2323we-2048x1062.jpg",
    herovideo: '',
    description: 'Talk About IT merupakan event kolaborasi antara CommIT (Komunitas IT) dan Mahavira',
    about: 'Talk About IT merupakan event kolaborasi antara CommIT (Komunitas IT) dan Mahavira, sebagai official partner brand Ruijie Reyee, yang menghadirkan diskusi dan sharing session seputar teknologi jaringan terbaru.\n\nPada event ini, peserta mendapatkan insight mendalam mengenai solusi Fiber to the Rooms (FTTR) dari Ruijie Reyee, sebuah teknologi jaringan berbasis fiber optic yang dirancang untuk menghadirkan koneksi internet berkecepatan tinggi, stabil, dan scalable hingga ke setiap ruangan.\n\nAcara ini bertujuan untuk:\n\nMengenalkan inovasi terbaru Ruijie Reyee dalam solusi jaringan modern\n\nMembahas implementasi FTTR untuk hotel, apartemen, perkantoran, dan properti komersial\n\nSharing best practice instalasi dan manajemen jaringan berbasis fiber\n\nMembangun networking antar profesional IT di Bandung dan sekitarnya\n\nDengan menghadirkan praktisi dan partner teknologi, Talk About IT menjadi wadah diskusi interaktif bagi para IT enthusiast, system integrator, dan pelaku industri untuk memahami perkembangan infrastruktur jaringan masa depan.\n\nEvent ini juga memperkuat kolaborasi antara komunitas, partner teknologi, dan brand dalam mendukung transformasi digital yang lebih optimal dan efisien.',
    solution: '',
    results: [

    ],
    services: ['Workshop'],
    gallery: [
      { img: "/assets/event1/IMG-20240524-WA0209.jpg", alt: 'Event 1 Image 2', type: '3', orderBy: 1 },
      { img: "/assets/event1/Screenshot_2427-720x447.png", alt: 'Event 1 Image 3', type: '1', orderBy: 2 },
      { img: "/assets/event1/WhatsApp-Image-2024-05-24-at-18.46.39_23e20fdf-2048x1537.jpg", alt: 'Event 1 Image 4', type: '2', orderBy: 3 },
    ],
    nextProject: 'HALAL BIHALAL COMMIT CBN MPS',
    prevProject: '',
    template: 'Template 1',
    keyTakeaways: {},
    startDate: "2026-02-20T06:31:33.338Z",
    endDate: "2026-02-20T07:31:33.338Z",
    color: "red",
    user: {
      id: "f3b035ac-49f7-4e92-a715-35680bf63175",
      name: "Michael Doe",
      picturePath: null,
    },
  },
  {
    id: 'HALAL BIHALAL COMMIT CBN MPS',
    title: 'HALAL BIHALAL COMMIT CBN MPS',
    category: 'Halal bihalal',
    year: '10 MAY 2024',
    client: '',
    heroImage: "/assets/event2/Screenshot_2251.png",
    herovideo: '',
    thumbnail: "/assets/event2/Screenshot_2251.png",
    description: '',
    about: '',
    solution: '',
    results: [
    ],
    services: ['Halal bihalal'],
    gallery: [
      { img: "/assets/event2/Screenshot_2251.png", alt: 'Event 2 Image 1', type: '2', orderBy: 1 },
      { img: "/assets/event2/Screenshot_2253.png", alt: 'Event 2 Image 2', type: '1', orderBy: 2 },
      { img: "/assets/event2/Screenshot_2254.png", alt: 'Event 2 Image 3', type: '1', orderBy: 3 },
      { img: "/assets/event2/WhatsApp-Image-2024-05-09-at-20.26.06_5dad1ea3-720x708.jpg", alt: 'Event 2 Image 4', type: '1', orderBy: 4 },
      { img: "/assets/event2/WhatsApp-Image-2024-05-15-at-11.37.16_a78cfc48-720x737.jpg", alt: 'Event 2 Image 5', type: '1', orderBy: 5 },
    ],
    nextProject: 'COMMIT GATHERING WITH PRIMALINKNET',
    prevProject: 'TALK ABOUT IT RUIJIE REYEE',
    template: 'Template 1',
    keyTakeaways: {

    },
    startDate: "2026-02-20T06:31:33.338Z",
    endDate: "2026-02-20T07:31:33.338Z",
    color: "blue",
    user: {
      id: "f3b035ac-49f7-4e92-a715-35680bf63175",
      name: "Michael Doe",
      picturePath: null,
    },
  },
  {
    id: 'COMMIT GATHERING WITH PRIMALINKNET',
    title: 'COMMIT GATHERING WITH PRIMALINKNET',
    category: 'GATHERING',
    year: '23 February 2024',
    client: '',
    heroImage: "/assets/event3/IMG_3250-1-720x480.jpg",
    herovideo: '',
    thumbnail: "/assets/event3/IMG_3250-1-720x480.jpg",
    description: '',
    about: '',
    solution: '',
    results: [
    ],
    services: ['GATHERING'],
    gallery: [
      { img: "/assets/event3/IMG_3250-1-720x480.jpg", alt: 'Event 3 Image 1', type: '2', orderBy: 1 },
      { img: "/assets/event3/IMG_3259-720x480.jpg", alt: 'Event 3 Image 2', type: '1', orderBy: 2 },
      { img: "/assets/event3/IMG_3297-720x480.jpg", alt: 'Event 3 Image 3', type: '1', orderBy: 3 },
      { img: "/assets/event3/IMG_3299-720x480.jpg", alt: 'Event 3 Image 4', type: '1', orderBy: 4 },
      { img: "/assets/event3/commit-3-1536x1152.jpg", alt: 'Event 3 Image 5', type: '1', orderBy: 5 }
    ],
    nextProject: 'TALK ABOUT IT BY OMADA',
    prevProject: 'HALAL BIHALAL COMMIT CBN MPS',
    template: 'Template 1',
    keyTakeaways: {},
    startDate: "2026-02-22T06:31:33.338Z",
    endDate: "2026-02-22T07:31:33.338Z",
    color: "blue",
    user: {
      id: "f3b035ac-49f7-4e92-a715-35680bf63175",
      name: "Michael Doe",
      picturePath: null,
    },
  },
  {
    id: 'TALK ABOUT IT BY OMADA',
    title: 'TALK ABOUT IT BY OMADA',
    category: 'Event',
    year: '02 February 2024',
    client: 'Cascade Ventures',
    heroImage: "/assets/event4/pressrelease-1-1536x798.jpg",
    herovideo: '',
    thumbnail: "/assets/event4/pressrelease-1-1536x798.jpg",
    description: '',
    about: '',
    solution: '',
    results: [
    ],
    services: ['Event'],
    gallery: [
      { img: "/assets/event4/pressrelease-1-1536x798.jpg", alt: 'Event 4 Image 7', type: '2', orderBy: 1 },
      { img: "/assets/event4/20240202180858_IMG_16041-720x405.jpg", alt: 'Event 4 Image 6', type: '1', orderBy: 2 },
      { img: "/assets/event4/20240202181155_IMG_16111-720x405.jpg", alt: 'Event 4 Image 1', type: '1', orderBy: 3 },
      { img: "/assets/event4/20240202193639_IMG_1651-720x405.jpg", alt: 'Event 4 Image 2', type: '1', orderBy: 4 },
      { img: "/assets/event4/20240202202548_IMG_1685-720x405.jpg", alt: 'Event 4 Image 4', type: '1', orderBy: 5 },
      { img: "/assets/event4/20240202221221_IMG_1713-720x405.jpg", alt: 'Event 4 Image 3', type: '1', orderBy: 6 },
      { img: "/assets/event4/WhatsApp-Image-2024-01-23-at-18.40.37_be630557.jpg", alt: 'Event 4 Image 5', type: '2', orderBy: 7 },
    ],
    nextProject: 'CONNECT & ADVANCE WITH EXTREME NETWORK',
    prevProject: 'COMMIT GATHERING WITH PRIMALINKNET',
    template: 'Template 1',
    keyTakeaways: {},
    media: [
      {
        img: "/assets/media/Bandung24jam-300x116.jpg",
        media: 'bandung24jam',
        link: 'https://bandung24jam.id/2024/02/07/komunitas-profesional-it-berkumpul-di-bandung-berbagi-pengetahuan/'
      },
      {
        img: "/assets/media/Businessinasia-300x116.jpg",
        media: 'Businessinasia',
        link: 'https://businessinasia.id/kolaborasi-committp-link-omada-dan-mahavira-gelar-diskusi-talk-bout-it/%20'
      },
      {
        img: "/assets/media/Elshinta-300x116.jpg",
        media: 'Elshinta',
        link: 'https://elshinta.com/news/327196/2024/02/06/commit-indonesia-dan-tp-link-omada-serta-mahavira-gelar-diskusi-talk-bout-it%20'
      },
      {
        img: "/assets/media/Jabar-Exspress-300x116.jpg",
        media: 'Jabar Exspress',
        link: 'https://jabarekspres.com/berita/2024/02/06/tp-link-omada-gelar-diskusi-bareng-dengan-commit/'
      },
      {
        img: "/assets/media/SWA-300x116.jpg",
        media: 'SWA',
        link: 'https://swa.co.id/swa/trends/technology/commit-indonesia-kupas-solusi-terkini-access-point-dan-manajemen-jaringan%20'
      },
      {
        img: "/assets/media/TribunJabarID-300x116.jpg",
        media: 'TribunJabarID',
        link: 'https://jabar.tribunnews.com/2024/02/06/commit-indonesia-kolabrasi-dengan-tp-link-omada-mahavira-untuk-dukung-perkembangan-teknologi%20'
      },
      {
        img: "/assets/media/biskom-300x116.jpg",
        media: 'biskom',
        link: 'https://www.biskom.web.id/2024/02/06/commit-bersama-tp-link-omada-dan-mahavira-gelar-diskusi-bertema-talk-bout-it.bwi'
      },
      {
        img: "/assets/media/it-works-300x116.jpg",
        media: 'it works',
        link: 'https://www.itworks.id/65476/cari-solusi-permasalahan-it-mahavira-bersama-tp-link-omada-dan-commit-indonesia-gelar-diskusi-talk-bout-it.html'
      },
      {
        img: "/assets/media/itech-300x116.jpg",
        media: 'itech',
        link: 'https://itechmagz.id/2024/02/06/commit-indonesia-gelar-diskusi-talk-bout-it-bersama-tp-link-omada-dan-mahavira/%20'
      },
      {
        img: "/assets/media/radarbandung-300x116.jpg",
        media: 'radarbandung',
        link: 'https://www.radarbandung.id/2024/02/05/talk-bout-it-lebih-dari-sekedar-diskusi-it/%20'
      },
      {
        img: "/assets/media/trijaya-300x116.jpg",
        media: 'trijaya',
        link: 'https://www.mnctrijaya.com/news/detail/64697/bersama-tp-link-omada-commit-indonesia-dan-mahavira-lebih-dari'
      },

    ],
    startDate: "2026-02-22T06:31:33.338Z",
    endDate: "2026-02-22T07:31:33.338Z",
    color: "green",
  },
  {
    id: 'CONNECT & ADVANCE WITH EXTREME NETWORK',
    title: 'CONNECT & ADVANCE WITH EXTREME NETWORK',
    category: 'Event',
    year: '08 September 2023',
    client: '',
    heroImage: "/assets/event5/WhatsApp-Image-2023-09-02-at-16.05.03-1.jpg",
    herovideo: "/assets/event5/WhatsApp-Video-2023-09-08-at-13.11.36.mp4",
    thumbnail: "/assets/event5/WhatsApp-Image-2023-09-02-at-16.05.03-1.jpg",
    description: '',
    about: '',
    solution: '',
    results: [
    ],
    services: ['Workshop'],
    gallery: [
      { img: "/assets/event5/WhatsApp-Image-2023-09-08-at-19.39.52-720x332.jpg", alt: 'Event 5 Image 3', type: '3', orderBy: 1 },
      { img: "/assets/event5/WhatsApp-Image-2023-09-08-at-22.10.57-1536x709.jpg", alt: 'Event 5 Image 2', type: '1', orderBy: 2 },
      { img: "/assets/event5/WhatsApp-Image-2023-09-08-at-22.10.58-720x332.jpg", alt: 'Event 5 Image 4', type: '2', orderBy: 3 },
      { img: "/assets/event5/WhatsApp-Image-2023-09-08-at-22.13.51-720x324.jpg", alt: 'Event 5 Image 5', type: '3', orderBy: 4 },
    ],
    nextProject: 'Jawa Barat ICT SUMMIT 2023',
    prevProject: 'TALK ABOUT IT BY OMADA',
    template: 'Template 2',
    keyTakeaways: {},
    startDate: "2026-02-22T06:31:33.338Z",
    endDate: "2026-02-22T07:31:33.338Z",
    color: "red",
  },
  {
    id: 'Jawa Barat ICT SUMMIT 2023',
    title: 'Jawa Barat ICT SUMMIT 2023',
    category: 'Event',
    year: '01 September 2023',
    client: '',
    heroImage: "/assets/event6/Jawa-Barat-ICT-Summit-2023-1018x1024.jpg",
    herovideo: "/assets/event6/Jawa-Barat-ICT-Summit-2023-Invitation.mp4",
    thumbnail: "/assets/event6/Jawa-Barat-ICT-Summit-2023-1018x1024.jpg",
    description: '',
    about: '',
    solution: '',
    results: [
    ],
    services: ['Workshop'],
    gallery: [
      { img: "/assets/event6/WhatsApp-Image-2023-09-02-at-07.34.04.jpg", alt: 'Event 6 Image 2', type: '3', orderBy: 1 },
      { img: "/assets/event6/WhatsApp-Image-2023-09-02-at-07.34.0asdsd4-720x324.jpg", alt: 'Event 6 Image 3', type: '2', orderBy: 2 },
      { img: "/assets/event6/WhatsApp-Image-2023-09-02-at-07.34.0dsdse7-720x324.jpg", alt: 'Event 6 Image 4', type: '1', orderBy: 3 },
      { img: "/assets/event6/WhatsApp-Image-2023-09-02-at-07.34.ewewe05-720x324.jpg", alt: 'Event 6 Image 5', type: '1', orderBy: 4 },
      { img: "/assets/event6/WhatsApp-Image-2023-09-02-at-07.34.sdsds06-720x324.jpg", alt: 'Event 6 Image 6', type: '1', orderBy: 5 },
      { img: "/assets/event6/WhatsApp-Image-2023-09-02-at-07.34.wee04-720x324.jpg", alt: 'Event 6 Image 7', type: '1', orderBy: 6 },
      { img: "/assets/event6/WhatsApp-Image-2023-09-02-at-07.34wewdsd.05-720x324.jpg", alt: 'Event 6 Image 8', type: '3', orderBy: 7 },
    ],
    media: media2,
    nextProject: 'Opening Ceremony new Organization name caled CommIT',
    prevProject: 'CONNECT & ADVANCE WITH EXTREME NETWORK',
    template: 'Template 2',
    keyTakeaways: {},
    startDate: "2026-02-22T06:31:33.338Z",
    endDate: "2026-02-22T07:31:33.338Z",
    color: "purple",
  },
  {
    id: 'Opening Ceremony new Organization name caled CommIT',
    title: 'Opening Ceremony new Organization name caled CommIT',
    category: 'Opening Ceremony',
    year: '25 Agustus 2023',
    client: '',
    heroImage: "/assets/event7/kuro-banner-1536x768.png",
    herovideo: '',
    thumbnail: "/assets/event7/kuro-banner-1536x768.png",
    description: '',
    about: '',
    solution: '',
    results: [
    ],
    services: ['Opening Ceremony'],
    gallery: [
      { img: "/assets/event7/CommIT-images001-web001-720x407.png", alt: 'Event 7 Image 1', type: '3', orderBy: 1 },
      { img: "/assets/event7/CommIT-images001-web002-720x407.png", alt: 'Event 7 Image 2', type: '3', orderBy: 2 },
      { img: "/assets/event7/CommIT-images001-web003-720x407.png", alt: 'Event 7 Image 3', type: '3', orderBy: 3 },
      // { img: event7.event7_img4, alt: 'Event 7 Image 4', type: '1', orderBy: 4 },
    ],
    media: [],
    partner: partner,
    nextProject: '',
    prevProject: 'Jawa Barat ICT SUMMIT 2023',
    template: 'Template 1',
    keyTakeaways: {},
    startDate: "2026-02-22T06:31:33.338Z",
    endDate: "2026-02-22T07:31:33.338Z",
    color: "yellow",
  },
];

export const getProjectById = (id: string): Project | undefined => {
  return projects.find((p) => p.id === id);
};

export const getProjectIndex = (id: string): number => {
  return projects.findIndex((p) => p.id === id);
};
