import{Country,factory}from"../modules.js";const PATH_RESOURCES_MAPS="./components/maps/";class Maps{parent;constructor(r){this.parent=r}async render(r){const e=r.props,{resource:o,resource_full:t}=e;if(!o)return void console.log("Not found key [resource] in props.");const s=new Country(this.parent),n=await factory.importResource(PATH_RESOURCES_MAPS,o);if(await s.render(n.lands),s.renderInfo(n.meta),t){const r=await factory.importResource(PATH_RESOURCES_MAPS,t);s.meta=r.lands.meta}}reset(){this.parent.innerHTML=""}}export default Maps;