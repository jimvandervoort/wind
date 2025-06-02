import { defineCustomElement } from 'vue';
import KiteRegionCE from './components/KiteRegion.ce.vue';

const JimWind = defineCustomElement(KiteRegionCE);
customElements.define('jim-wind', JimWind);
