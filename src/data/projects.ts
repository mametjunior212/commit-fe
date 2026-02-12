import { event1_img1, event1_img2, event1_img3, event1_img4 } from '@/assets/event1/event1';
import { event2_img1, event2_img2, event2_img3, event2_img4, event2_img5 } from '@/assets/event2/event2';
import { event3_img1, event3_img2, event3_img3, event3_img4, event3_img5 } from '@/assets/event3/event3';
import { event4_img1, event4_img2, event4_img3, event4_img4, event4_img5, event4_img6, event4_img7 } from '@/assets/event4/event4';
import { event5_img1, event5_img2, event5_img3, event5_img4, event5_img5, event5_video1 } from '@/assets/event5/event5';
import { media_Bandung24jam, media_Businessinasia, media_Elshinta, media_Jabar_Exspress, media_SWA, media_TribunJabarID, media_biskom, media_it_works, media_itech, media_radarbandung, media_trijaya } from '@/assets/media/media';
import video from '@/assets/dashboard.mp4';

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
  gallery: string[];
  nextProject: string;
  prevProject: string;
  template: string;
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
}

export const projects: Project[] = [
  {
    id: 'TALK ABOUT IT RUIJIE REYEE',
    title: 'TALK ABOUT IT RUIJIE REYEE',
    category: 'EVENT',
    year: '24 MAY 2024',
    client: '',
    heroImage: event1_img1,
    thumbnail: event1_img1,
    herovideo: '',
    description: 'Talk About IT merupakan event kolaborasi antara CommIT (Komunitas IT) dan Mahavira',
    about: 'Talk About IT merupakan event kolaborasi antara CommIT (Komunitas IT) dan Mahavira, sebagai official partner brand Ruijie Reyee, yang menghadirkan diskusi dan sharing session seputar teknologi jaringan terbaru.\n\nPada event ini, peserta mendapatkan insight mendalam mengenai solusi Fiber to the Rooms (FTTR) dari Ruijie Reyee, sebuah teknologi jaringan berbasis fiber optic yang dirancang untuk menghadirkan koneksi internet berkecepatan tinggi, stabil, dan scalable hingga ke setiap ruangan.\n\nAcara ini bertujuan untuk:\n\nMengenalkan inovasi terbaru Ruijie Reyee dalam solusi jaringan modern\n\nMembahas implementasi FTTR untuk hotel, apartemen, perkantoran, dan properti komersial\n\nSharing best practice instalasi dan manajemen jaringan berbasis fiber\n\nMembangun networking antar profesional IT di Bandung dan sekitarnya\n\nDengan menghadirkan praktisi dan partner teknologi, Talk About IT menjadi wadah diskusi interaktif bagi para IT enthusiast, system integrator, dan pelaku industri untuk memahami perkembangan infrastruktur jaringan masa depan.\n\nEvent ini juga memperkuat kolaborasi antara komunitas, partner teknologi, dan brand dalam mendukung transformasi digital yang lebih optimal dan efisien.',
    solution: '',
    results: [

    ],
    services: ['Workshop'],
    gallery: [
      event1_img2,
      event1_img3,
      event1_img4,
    ],
    nextProject: 'HALAL BIHALAL COMMIT CBN MPS',
    prevProject: '',
    template: '1',
    keyTakeaways: {},
  },
  {
    id: 'HALAL BIHALAL COMMIT CBN MPS',
    title: 'HALAL BIHALAL COMMIT CBN MPS',
    category: 'Workshop',
    year: '10 MAY 2024',
    client: '',
    heroImage: event2_img1,
    herovideo: '',
    thumbnail: event2_img1,
    description: '',
    about: '',
    solution: '',
    results: [
    ],
    services: ['Workshop'],
    gallery: [
      event2_img1,
      event2_img2,
      event2_img3,
      event2_img4,
      event2_img5,
    ],
    nextProject: 'COMMIT GATHERING WITH PRIMALINKNET',
    prevProject: '',
    template: '1',
    keyTakeaways: {

    },
  },
  {
    id: 'COMMIT GATHERING WITH PRIMALINKNET',
    title: 'COMMIT GATHERING WITH PRIMALINKNET',
    category: 'Digital Campaign',
    year: '23 February 2024',
    client: '',
    heroImage: event3_img5,
    herovideo: '',
    thumbnail: event3_img5,
    description: '',
    about: '',
    solution: '',
    results: [
    ],
    services: ['Digital Campaign'],
    gallery: [
      event3_img1,
      event3_img2,
      event3_img3,
      event3_img4,
      event3_img5
    ],
    nextProject: 'TALK ABOUT IT BY OMADA',
    prevProject: '',
    template: '1',
    keyTakeaways: {},
  },
  {
    id: 'TALK ABOUT IT BY OMADA',
    title: 'TALK ABOUT IT BY OMADA',
    category: 'Event',
    year: '2023',
    client: 'Cascade Ventures',
    heroImage: event4_img6,
    herovideo: '',
    thumbnail: event4_img6,
    description: '',
    about: '',
    solution: '',
    results: [
    ],
    services: ['Event'],
    gallery: [
      event4_img7, event4_img1, event4_img2, event4_img3, event4_img4, event4_img5, event4_img6
    ],
    nextProject: 'CONNECT & ADVANCE WITH EXTREME NETWORK',
    prevProject: '',
    template: '1',
    keyTakeaways: {},
    media: [
      {
        img: media_Bandung24jam,
        media: 'bandung24jam',
        link: 'https://bandung24jam.id/2024/02/07/komunitas-profesional-it-berkumpul-di-bandung-berbagi-pengetahuan/'
      },
      {
        img: media_Businessinasia,
        media: 'Businessinasia',
        link: 'https://businessinasia.id/kolaborasi-committp-link-omada-dan-mahavira-gelar-diskusi-talk-bout-it/%20'
      },
      {
        img: media_Elshinta,
        media: 'Elshinta',
        link: 'https://elshinta.com/news/327196/2024/02/06/commit-indonesia-dan-tp-link-omada-serta-mahavira-gelar-diskusi-talk-bout-it%20'
      },
      {
        img: media_Jabar_Exspress,
        media: 'Jabar Exspress',
        link: 'https://jabarekspres.com/berita/2024/02/06/tp-link-omada-gelar-diskusi-bareng-dengan-commit/'
      },
      {
        img: media_SWA,
        media: 'SWA',
        link: 'https://swa.co.id/swa/trends/technology/commit-indonesia-kupas-solusi-terkini-access-point-dan-manajemen-jaringan%20'
      },
      {
        img: media_TribunJabarID,
        media: 'TribunJabarID',
        link: 'https://jabar.tribunnews.com/2024/02/06/commit-indonesia-kolabrasi-dengan-tp-link-omada-mahavira-untuk-dukung-perkembangan-teknologi%20'
      },
      {
        img: media_biskom,
        media: 'biskom',
        link: 'https://www.biskom.web.id/2024/02/06/commit-bersama-tp-link-omada-dan-mahavira-gelar-diskusi-bertema-talk-bout-it.bwi'
      },
      {
        img: media_it_works,
        media: 'it works',
        link: 'https://www.itworks.id/65476/cari-solusi-permasalahan-it-mahavira-bersama-tp-link-omada-dan-commit-indonesia-gelar-diskusi-talk-bout-it.html'
      },
      {
        img: media_itech,
        media: 'itech',
        link: 'https://itechmagz.id/2024/02/06/commit-indonesia-gelar-diskusi-talk-bout-it-bersama-tp-link-omada-dan-mahavira/%20'
      },
      {
        img: media_radarbandung,
        media: 'radarbandung',
        link: 'https://www.radarbandung.id/2024/02/05/talk-bout-it-lebih-dari-sekedar-diskusi-it/%20'
      },
      {
        img: media_trijaya,
        media: 'trijaya',
        link: 'https://www.mnctrijaya.com/news/detail/64697/bersama-tp-link-omada-commit-indonesia-dan-mahavira-lebih-dari'
      },
    ],
  },
  {
    id: 'CONNECT & ADVANCE WITH EXTREME NETWORK',
    title: 'CONNECT & ADVANCE WITH EXTREME NETWORK',
    category: 'Event',
    year: '08 September 2023',
    client: '',
    heroImage: event5_img1,
    herovideo: event5_video1,
    thumbnail: event5_img1,
    description: '',
    about: '',
    solution: '',
    results: [
    ],
    services: ['Digital Campaign'],
    gallery: [
      event5_img3,
      event5_img2,
      event5_img4,
      event5_img5,
    ],
    nextProject: '',
    prevProject: '',
    template: '2',
    keyTakeaways: {},
  },
];

export const getProjectById = (id: string): Project | undefined => {
  return projects.find((p) => p.id === id);
};

export const getProjectIndex = (id: string): number => {
  return projects.findIndex((p) => p.id === id);
};
