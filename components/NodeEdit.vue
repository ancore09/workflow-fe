<script setup lang="ts">
const props = defineProps({
  node: {
    type: Object
  }
})



</script>

<template>
  <Card class="w-full">
    <template #title>Node Edit</template>

    <template #content>
      <div class="flex flex-column gap-2 my-2">
        <IftaLabel>
          <InputText id="name" v-model="node.name" />
          <label for="name">Node name</label>
        </IftaLabel>

        <IftaLabel>
          <InputText id="handler" v-model="node.handler"/>
          <label for="handler">handler name</label>
        </IftaLabel>

        <IftaLabel>
          <InputText id="condition" v-model="node.condition"/>
          <label for="condition">Condition</label>
        </IftaLabel>

        <label>Outputs</label>
        <div class="flex flex-column gap-2">
          <Chip v-for="i in node.outputs" :key="i" :label="i" />
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>

</style>