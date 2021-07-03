<script>
const getAge = (birthDate) => {
  let today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  var month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() - birthDate.getDate())) {
    age--;
  }
  return age;
};

export default {
  data() {
    return {
      age: getAge(new Date(1995, 8, 22)),
    };
  },
};
</script>

<template>
  <div class="h-auto mb-5">
    <div
      class="
        px-5
        pt-4
        pb-6
        mx-5
        shadow-lg
        text-gray-100 text-sm
        font-mono
        subpixel-antialiased
        bg-gray-800
        leading-normal
        rounded-lg
      "
    >
      <!--The menu bar-->
      <div class="top flex items-center border-b-2 border-dashed border-gray-700 pb-2">
        <div class="py-auto h-3 w-3 bg-red-500 rounded-full"></div>
        <div class="flex-none ml-2 h-3 w-3 bg-yellow-300 rounded-full"></div>
        <div class="flex-none ml-2 h-3 w-3 bg-green-500 rounded-full"></div>
        <span class="mx-auto">My Virtual Terminal</span>
      </div>
      <!-- Interactive Terminal Area -->
      <div class="mt-4 flex">
        <span class="text-green-400">anon@edwardvaisman.ca:~$</span>
        <p class="flex-1 typing items-center pl-2">
          apt-get hire me
        </p>
      </div>
      <div class="mt-4 flex">
        <span class="text-green-400">anon@edwardvaisman.ca:~$</span>
        <p class="flex-1 typing items-center pl-2">
          apt-get hire me
        </p>
      </div>
    </div>
  </div>
</template>
