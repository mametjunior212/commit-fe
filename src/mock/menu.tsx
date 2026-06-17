import { ApiMenu } from "@/components/type/MenuType";

export const Parameter = [
    {
        "uuid": "45018d2a-6dfd-4c4e-8f72-87c0c92743b9",
        "nama_param": "Tiktok",
        "value_param": ""
    },
    {
        "uuid": "deb2df93-cec9-4784-9882-5ba7cdb15b38",
        "nama_param": "Facebook",
        "value_param": ""
    },
    {
        "uuid": "a4791a0f-b8bc-4551-9efe-f09f1ea440d6",
        "nama_param": "Twitter",
        "value_param": ""
    },
    {
        "uuid": "eb73c74b-85e3-482e-8d9f-0d8156bfb1d1",
        "nama_param": "instagram",
        "value_param": "https://www.instagram.com/commit_indonesia/"
    },
    {
        "uuid": "738d0c5b-d514-4060-9889-ec45cad315f1",
        "nama_param": "email",
        "value_param": "commitjabar@gmail.com"
    },
    {
        "uuid": "dd7c1f31-0beb-4a6c-b39c-e38ee47d7636",
        "nama_param": "Kontak",
        "value_param": "+62 851-8258-3624"
    },
    {
        "uuid": "defe59c9-5869-4590-8ad7-e8c362b664e9",
        "nama_param": "Lokasi",
        "value_param": "Bandung, Indonesia"
    },
    {
        "uuid": "f0e43c83-837a-4c57-86cb-a0fc583e1e98",
        "nama_param": "Logo About",
        "value_param": "/assets/CommIT-image-2.png"
    },
    {
        "uuid": "507e41c8-7b1a-41c0-8b74-02facea4a463",
        "nama_param": "Struktur Organisasi About",
        "value_param": "/assets/Struktur-Organisasi.png"
    },
    {
        "uuid": "0915f6ab-0daf-4377-8bcd-5382ab9c7ebf",
        "nama_param": "Deskripsi About",
        "value_param": "CommIT Indonesia adalah Komunitas Perkumpulan IT Seluruh Indonesia yang didirikan pada tanggal 25 Agustus 2023. Sebagai wadah bagi para profesional IT dari berbagai segmen industri seperti Hospitality, Pendidikan, Sistem Integrator, Instansi Pemerintahan, Theme Park, dan lainnya, kami bertekad untuk menciptakan platform yang memungkinkan kolaborasi dan pertukaran pengetahuan yang produktif.\n\n                Kami percaya bahwa melalui diskusi dan kolaborasi, kami dapat memperkuat industri IT di Indonesia serta meningkatkan kemampuan dan inovasi di bidang teknologi informasi. Dengan menghubungkan para profesional IT dari berbagai latar belakang, kami berharap dapat mendorong pertumbuhan dan kemajuan yang berkelanjutan dalam industri ini.\n\n                Bergabunglah dengan kami untuk menjadi bagian dari komunitas yang dinamis dan bersemangat untuk mengembangkan potensi teknologi informasi di Indonesia. Mari kita bersama-sama menciptakan masa depan yang lebih baik melalui kolaborasi, pembelajaran, dan inovasi dalam CommIT Indonesia."
    },
    {
        "uuid": "d119b995-ee1a-47ce-8a56-82c02b3c13b0",
        "nama_param": "Background Hero Landing Page",
        "value_param": "/assets/hero-bg.png"
    },
    {
        "uuid": "2c6dbf4f-c722-4434-936c-e1aa52469c46",
        "nama_param": "Link Button 2 Landing Page",
        "value_param": "/event"
    },
    {
        "uuid": "9a2feff7-3325-4079-8f1b-25c5b27cb8bc",
        "nama_param": "Label Button 2 Landing Page",
        "value_param": "Mulai Jelajahi"
    },
    {
        "uuid": "6a07ddf2-88af-45f4-b4c7-907121166de2",
        "nama_param": "Link Button 1 Landing Page",
        "value_param": "/about"
    },
    {
        "uuid": "7ac8cdf2-eb0f-41e5-a5c8-af3d79ca84da",
        "nama_param": "Label Button 1 Landing Page",
        "value_param": "Tentang Kami"
    },
    {
        "uuid": "80aee67d-bb44-4312-965d-09e7a9f42a38",
        "nama_param": "Deskripsi Landing Page",
        "value_param": "CommIT Indonesia adalah Komunitas Perkumpulan IT Seluruh Indonesia yang didirikan pada tanggal 25 Agustus 2023."
    },
    {
        "uuid": "2a495c65-6deb-49ca-ac0e-fceb89c412d1",
        "nama_param": "Video Landing Page",
        "value_param": "/assets/dashboard.mp4"
    }
];

export const Menu: ApiMenu[] = [
    {
        "uuid": "14865ae7-6feb-41f6-baec-8670fed92cb8",
        "name": "Event",
        "order": 1,
        "route": null,
        "children": [
            {
                "uuid": "b71b2db4-7561-40cf-80e5-2fbf4025aace",
                "name": "Event",
                "order": 1,
                "route": {
                    "uuid": "2a742424-098f-4736-a50f-e7eacf072a26",
                    "name": "Event",
                    "url": "/event",
                    "route": "event.route",
                    "method": "GET"
                },
                "children": []
            },
            {
                "uuid": "caafa696-8b30-4c91-891d-d9cfcb915193",
                "name": "Calendar",
                "order": 2,
                "route": {
                    "uuid": "cb0b71e6-4a41-4583-8b51-666d3be11abd",
                    "name": "Calendar",
                    "url": "/calendar",
                    "route": "calendar.route",
                    "method": "GET"
                },
                "children": []
            }
        ]
    },
    {
        "uuid": "cdbbc744-4144-4f1c-8ce0-0a946ce9db2d",
        "name": "About",
        "order": 2,
        "route": {
            "uuid": "3e6d1ee2-6870-4560-a897-f1ac0c4c6532",
            "name": "About",
            "url": "/about",
            "route": "about.route",
            "method": "GET"
        },
        "children": []
    },
    {
        "uuid": "faa50d08-4396-4256-b504-812ac9b077f6",
        "name": "Contact",
        "order": 3,
        "route": {
            "uuid": "8191a359-ab0a-4cf1-a647-a250826244aa",
            "name": "Contact",
            "url": "/contact",
            "route": "contact.route",
            "method": "GET"
        },
        "children": []
    }
];