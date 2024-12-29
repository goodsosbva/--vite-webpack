import { createApp } from 'vue'
import Exposed from '../src/Exposed.vue'

// remote 자체를 열었을 때도 Vue 컴포넌트가 표시되도록:
createApp(Exposed).mount('#app')
