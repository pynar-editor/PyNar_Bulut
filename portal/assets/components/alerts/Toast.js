const Template = `
    <span class="toast-position fixed-bottom p-3 z-index-1050">
        <div :id="id" class="toast hide" data-bs-delay="5000" role="alert" aria-live="polite" aria-atomic="true">
            <div :class="'toast-header ' + className">
                <span class="px-2">
                    <i :class="'fa fa-' + icon"></i>
                </span>                   
                <strong class="me-auto">{{title}}</strong>
                <button type="button" class="btn-close" v-on:click="$emit('closeToast')" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                {{message}}
            </div>
        </div>
    </span>
`;

const Toast = {
    template: Template,
    props: {
        id: String,
        message: String,
        title: String,
        icon: String,
        className: String
    },
    methods: {
        closeToast(){
            $('#' + this.id).toast('hide');
        }
    }
};


Vue.component('Toast', Toast)

export default Toast;