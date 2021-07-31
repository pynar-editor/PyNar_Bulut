
const Section = {
    template: `
    <div>      
        <div class="border-1 border-dark">
            <textarea id="code" name="code"># Dosya yükleniyor...</textarea>
        </div>      
    </div>
      `
};

const Code = {
    template: `<component-section />`,
    components: {
        'component-section': Section
    }
};

Vue.component('Code', Code)

export default Code;