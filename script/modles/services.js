const { Service } = require("../../db");
async function createServices(){
    const services = await Service.bulkCreate([
        {
            title: 'ipone repair',
            description:'this is the iphone description',
            price: 1000
        },
        {
            title: 'math help',
            description:'I will help with math 121',
            price: 1000
        }
    ])
    return services
}

exports.createServices = createServices
