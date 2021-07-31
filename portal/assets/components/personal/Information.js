import Institution from './Institution.js';

const Template = `
<div>
    <div class=" bg-white shadow-sm my-3 p-md-5 p-3 w-100">
        <h2>Bilgilerim</h2>
        <hr/>
    </div>
    <div class="container my-3 mh-100 shadow-sm bg-white p-md-5 p-3 w-100 mw-100">
        <Institution/>         
    </div>
</div>
`;

const PersonalInformation = {
    template: Template,
    data: function() {
        return {
            choosenUser: localStorage.getItem('choosenUser'),
        }
    },
};


Vue.component('PersonalInformation', PersonalInformation)

export default PersonalInformation;