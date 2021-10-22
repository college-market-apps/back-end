const { tomProducts,
    jimProducts,
    gezProducts,
    bobProducts,
    collinProducts
} = require('./userProductsSeed')

const usersWithProducts = [
    {
        user: {
            name:'Gezahegn Starr',
            profileImage:'https://cdn.icon-icons.com/icons2/2643/PNG/512/man_boy_people_avatar_user_person_black_skin_tone_icon_159355.png',
            createdAt:new Date(),
            uid: process.env.GEZ_UID
        },
        products: gezProducts
    },
    {
        user:{
            name: 'Bob',
            profileImage:'https://www.kindpng.com/picc/m/78-786207_user-avatar-png-user-avatar-icon-png-transparent.png',
            email: 'bob@email.com',
            uid: process.env.BOB_UID
        },
        products: bobProducts
    },
    {
        user:{
            name: 'Jim',
            profileImage:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTB6At_WsdMZrn_ImShsz-Wm3yjXRdjZ905U8gLF_XJ3MJMbaEE9BIk_Q-2ALVvEOJXcfY&usqp=CAU',
            email: 'jim@email.com',
        },
        products: jimProducts
    },
    {
        user:{
            name: 'Tom',
            profileImage:'https://cdn.icon-icons.com/icons2/2643/PNG/512/male_man_person_people_avatar_white_tone_icon_159365.png',
            email: 'tom@email.com',
            uid:process.env.TOM_UID
        },
        products: tomProducts
    },
    {
        user:{
            name: 'Collin',
            profileImage:'https://www.kindpng.com/picc/m/664-6643641_avatar-transparent-background-user-icon-hd-png-download.png',
            email: 'tom@email.com',
        },
        products: collinProducts
    },
]

const school = {
    name: 'Michigan State University'
}

module.exports = {
    usersWithProducts,
    school
}
