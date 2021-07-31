import Toast from './Toast.js';

const Template = `
    <span>
        <Toast 
            message="İşlem başarısızlıkla sonuçlandı!" 
            icon="times" 
            id="error-toast" 
            title="Başarısız!" 
            className="bg-danger text-white" 
        />
        <Toast 
            message="İşlem başarıyla tamamlandı!" 
            icon="check" 
            id="success-toast" 
            title="Başarılı!" 
            className="bg-success text-white"
        />  
    </span>
`;

const Toasts = {
    template: Template,
};


Vue.component('Toasts', Toasts)

export default Toasts;