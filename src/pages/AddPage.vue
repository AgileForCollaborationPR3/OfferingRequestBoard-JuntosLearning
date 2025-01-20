<template>
  <q-page class="bg-lpage">
    <!-- Header -->
    <q-toolbar class="text-primary bg-lpage" flat>
      <q-btn v-if="step > 1" flat round dense icon="arrow_back" @click="prevStep" />
      <q-btn v-else flat round dense icon="close" @click="closePage" />
      <q-toolbar-title class="lora text-h6 text-weight-bold text-center">
        {{ isRequest ? 'Create New Learning Request' : 'Create New Learning Offering' }}
      </q-toolbar-title>
    </q-toolbar>

    <!-- Stepper -->
    <div class="q-px-md">
      <q-stepper v-model="step" contracted color="primary" inactive-color="accent" done-color="primary" animated flat
        :style="{ minHeight: 'Calc(100vh - 124px)', borderRadius: '20px' }">

        <!-- Step 1: Title -->
        <q-step :name="1" title="Title" icon="title" :done="step > 1">
          <div>
            <div class="text-h4 text-primary q-mb-md lora text-weight-bold">
              {{ isRequest ? 'Start with what You Want to Learn' : 'Start With What You Love to Teach!' }}
            </div>
            <div class="text-body2 text-primary-80 q-mb-md">
              {{ isRequest ? 'Describe what you want to learn or need help with learning.'
                : 'Describe what you love to teach and share with others from your community.' }}
            </div>
            <q-input v-model="formData.title" :label="isRequest ? 'I want to learn ...' : 'Learn ...'" outlined rounded
              maxlength="60" counter />
            <q-btn label="Continue" color="primary" class="q-mt-md full-width absolute-end" @click="nextStep"
              :disable="!formData.title" />
            <q-btn v-if="step > 1" flat color="primary" @click="prevStep" label="Back" />
          </div>
        </q-step>

        <!-- Step 2: When -->
        <q-step :name="2" title="When" icon="schedule" :done="step > 2">
          <div>
            <div class="row items-center justify-between q-mb-sm">
              <div class="col text-h4 text-primary lora text-weight-bold">Say When</div>
              <q-btn class="col-3" v-if="formData.timeOption" outline no-caps dense label="Reset" color="primary"
                @click="resetTimeSelection" />
            </div>
            <div class="text-body1 text-primary text-weight-bold">
              Date & Time
            </div>
            <div class="text-body2 text-primary-80 q-mb-md">
              Select a time option that suits your schedule.
            </div>

            <div class="row justify-center">
              <q-btn class="col-9 q-my-sm" :text-color="formData.timeOption === 'onDate' ? 'accent' : 'primary'"
                :color="formData.timeOption === 'onDate' ? 'primary' : 'accent'" @click="openOnDateDialog('onDate')"
                no-caps>
                {{ formData.timeOption === 'onDate' && formData.date ? `On Date: ${formatDate(formData.date)}`
                  : 'On Date' }}
              </q-btn>
              <q-btn class="col-9 q-my-sm" :text-color="formData.timeOption === 'beforeDate' ? 'accent' : 'primary'"
                :color="formData.timeOption === 'beforeDate' ? 'primary' : 'accent'"
                @click="openOnDateDialog('beforeDate')" no-caps>
                {{ formData.timeOption === 'beforeDate' && formData.date ? `Before Date: ${formatDate(formData.date)}`
                  : 'Before Date' }}
              </q-btn>
              <q-btn class="col-9 q-my-sm" :text-color="formData.timeOption === 'flexible' ? 'accent' : 'primary'"
                :color="formData.timeOption === 'flexible' ? 'primary' : 'accent'" @click="selectTimeOption('flexible')"
                no-caps>
                I'm Flexible
              </q-btn>
            </div>

            <q-checkbox v-model="formData.specificTime" label="I need a certain time of day" class="q-mt-md"
              checked-icon="task_alt" unchecked-icon="o_circle" color="primary" />


            <div v-if="formData.specificTime" class="q-mt-sm row">
              <div class="col-6 q-px-sm q-pb-md" v-for="time in timesOfDay" :key="time.value">
                <q-btn class="full-width" :icon="time.icon" clickable @click="selectTimeOfDay(time.value)"
                  :color="formData.timeOfDay === time.value ? 'primary' : 'accent'"
                  :text-color="formData.timeOfDay === time.value ? 'accent' : 'primary'" stack>
                  <span v-if="time.value === 'morning'" class="q-pt-sm" style="line-height:0.7">Morning <br> <span
                      class="text-caption">9 - 12</span></span>
                  <span v-if="time.value === 'midday'" class="q-pt-sm" style="line-height:0.7">Midday <br> <span
                      class="text-caption">12 - 14</span></span>
                  <span v-if="time.value === 'afternoon'" class="q-pt-sm" style="line-height:0.7">Afternoon <br> <span
                      class="text-caption">14 - 16</span></span>
                  <span v-if="time.value === 'evening'" class="q-pt-sm" style="line-height:0.7">Evening <br> <span
                      class="text-caption">16 - 20</span> <span class="text-caption">12
                      -
                      14</span></span>
                </q-btn>
              </div>
            </div>

            <q-dialog v-model="onDateDialog">
              <q-card style="min-width: 80vw;border-radius:20px;">
                <q-card-section>
                  <div class="text-h6">Select a Date</div>
                </q-card-section>

                <q-card-section>
                  <q-date v-model="formData.date" />
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat label="Cancel" color="negative" @click="onDateDialog = false" />
                  <q-btn flat label="Save" color="primary" @click="saveOnDate" />
                </q-card-actions>
              </q-card>
            </q-dialog>

            <div class="text-body1 text-primary text-weight-bold q-mt-md">
              Duration
            </div>
            <div class="text-body2 text-primary-80">
              How long do you think you need?
            </div>
            <q-select v-model="formData.duration" :options="durationOptions" label="Duration" outlined dense
              class="q-mt-md" @update:model-value="updateDuration" />

            <q-btn label="Continue" color="primary" class="q-mt-md full-width" @click="nextStep"
              :disable="!formData.date && formData.timeOption !== 'flexible'" />
          </div>
        </q-step>


        <!-- Step 3: Where -->
        <q-step :name="3" title="Where" icon="place" :done="step > 3">
          <div>
            <div class="row items-center justify-between q-mb-sm">
              <div class="col text-h4 text-primary lora text-weight-bold">Say Where</div>
              <q-btn class="col-3" v-if="locationOption" outline no-caps dense label="Reset" color="primary"
                @click="resetLocationSelection" />
            </div>
            <div class="text-body2 text-primary-80 q-mb-md">
              Select where the learning offering will take place.
            </div>

            <div class="row justify-center">
              <q-btn class="col-9 q-my-sm" :text-color="locationOption === 'online' ? 'accent' : 'primary'"
                :color="locationOption === 'online' ? 'primary' : 'accent'" @click="selectLocationOption('online')"
                no-caps>
                Online
              </q-btn>
              <q-btn class="col-9 q-my-sm" :text-color="locationOption === 'inPerson' ? 'accent' : 'primary'"
                :color="locationOption === 'inPerson' ? 'primary' : 'accent'" @click="openLocationDialog" no-caps>
                <div> {{ locationOption === 'inPerson' && formData.location ? 'In Person:' : 'In Person' }}</div>
                <div class="full-width" v-if="locationOption === 'inPerson' && formData.location">{{ formData.location
                  }}</div>
              </q-btn>
              <q-btn class="col-9 q-my-sm" :text-color="locationOption === 'flexible' ? 'accent' : 'primary'"
                :color="locationOption === 'flexible' ? 'primary' : 'accent'" @click="selectLocationOption('flexible')"
                no-caps>
                I'm Flexible
              </q-btn>
            </div>

            <q-dialog v-model="locationDialog">
              <q-card style="min-width: 80vw; border-radius: 20px;">
                <q-card-section>
                  <div class="text-h6">Enter Location</div>
                </q-card-section>

                <q-card-section>
                  <q-input v-model="formData.location" label="Location Address" outlined dense filled
                    prefix-icon="place" />
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat label="Cancel" color="negative" @click="locationDialog = false" />
                  <q-btn flat label="Save" color="primary" @click="saveLocation" />
                </q-card-actions>
              </q-card>
            </q-dialog>

            <q-btn label="Continue" color="primary" class="q-mt-md full-width" @click="nextStep"
              :disable="locationOption === 'inPerson' && !formData.location" />
          </div>
        </q-step>

        <!-- Step 4: What -->
        <q-step :name="4" title="What" icon="description" :done="step > 4">
          <div>
            <div class="col text-h4 text-primary lora text-weight-bold">What?</div>
            <div class="text-body1 text-primary text-weight-bold q-mt-md">
              Learning Format
            </div>
            <div class="text-body2 text-primary-80 q-mb-xs">
              Select the format you have in mind.
            </div>
            <q-checkbox v-model="formData.specificFormat" label="I don't have a learning format preference"
              class="q-mb-md text-primary" checked-icon="task_alt" unchecked-icon="o_circle" color="primary" />
            <div v-if="!formData.specificFormat">
              <q-chip v-for="option in learningFormats" :key="option.text" :label="option.text" :icon="option.icon"
                clickable @click="toggleFormat(option.text)"
                :color="formData.formats.includes(option.text) ? 'primary' : 'accent'"
                :text-color="formData.formats.includes(option.text) ? 'accent' : 'primary'" class="q-mb-sm" />
            </div>
            <div class="text-body1 text-primary text-weight-bold q-mt-md">
              Details
            </div>
            <div class="text-body2 text-primary-80 q-mb-md">Provide details about the learning experience you have in
              mind.</div>
            <q-input v-model="formData.details"
              placeholder="A 2-hour art class, a hands-on coding workshop, or a virtual mindfulness session." outlined
              type="textarea" dense class="q-mt-md" />

            <q-checkbox v-model="areCosts" label="There are costs" class="q-mt-sm" checked-icon="task_alt"
              unchecked-icon="o_circle" color="primary" />

            <div v-if="areCosts">
              <div class="text-body2 text-primary-80 q-mb-xs q-mt-md">Estimate cost per participant.</div>
              <q-input v-model.number="formData.cost" type="number" outlined dense class="col-6" placeholder="5">
                <template v-slot:before>
                  <q-icon name="euro_symbol" />
                </template></q-input>
              <div class="text-body2 text-primary-80 q-mb-xs q-mt-md">Describe the equipment and material costs.
              </div>
              <q-input v-model="formData.costDescription"
                placeholder="E.g., €50 for materials, €20 for equipment rental." outlined type="textarea" dense
                class="q-mb-md" />
            </div>


            <q-btn label="Continue" color="primary" class="q-mt-md full-width" @click="nextStep"
              :disable="!formData.formats.length && formData.specificFormat === false || !formData.details" />
          </div>
        </q-step>

        <!-- Step 5: Who -->
        <q-step :name="5" title="Who" icon="people" :done="step > 5">
          <div>
            <div class="col text-h4 text-primary lora text-weight-bold">Who?</div>
            <div>
              <q-checkbox v-model="formData.additionalRequirements" label="Prior knowledge or experience needed"
                class="text-primary" checked-icon="task_alt" unchecked-icon="o_circle" color="primary" />
              <div v-if="formData.additionalRequirements" class="text-body1 text-primary text-weight-bold q-mt-md">
                Set Prior Knowledge
              </div>
              <div v-if="formData.additionalRequirements" class="text-body2 text-primary-80">Specify prior
                knowledge or
                experience.</div>
              <q-input v-if="formData.additionalRequirements" v-model="formData.requirements"
                placeholder="E.g., Excel skills, coding basics, design experience." outlined class="q-my-md" />
            </div>
            <div class="text-body1 text-primary text-weight-bold q-mt-md">
              Set Age
            </div>
            <div class="text-body2 text-primary-80 q-mb-md">
              {{ isRequest ? "What's your age?" : "How old should learners be?" }}
            </div>

            <div v-if="isRequest" class="row q-mb-md">
              <q-input v-model.number="currentAge" type="number" label="Your Age" outlined dense class="col-12" />
              <p v-if="currentAge" class="text-caption text-primary-80 q-mt-xs">
                Age range will be set to: {{ currentAge - 2 }} - {{ currentAge + 2 }}.
              </p>
            </div>

            <div v-else class="row q-mb-md">
              <div class="col-5">
                <div class="text-body2 text-primary-80">Minimum Age
                </div>
                <q-input v-model.number="formData.minAge" type="number" placeholder="7" outlined dense />
              </div>
              <div class="col-5 offset-1">
                <div class="text-body2 text-primary-80">Maximum Age
                </div>
                <q-input v-model.number="formData.maxAge" type="number" placeholder="10" outlined dense />
              </div>
              <div class="col-11">
                <div class="text-body1 text-primary text-weight-bold q-mt-md">
                  Set Limit
                </div>
                <div class="text-body2 text-primary-80 q-mb-md">Set the maximum amount of people that can join.</div>
                <q-input v-model.number="formData.maxPeople" type="number" placeholder="10" outlined dense
                  class="q-mb-md" />
              </div>
            </div>

            <div>
              <div class="text-body1 text-primary text-weight-bold">
                Set Accessibility
              </div>
              <q-toggle class="q-mb-sm" v-model="formData.allowCommunity" checked-icon="check" color="primary"
                unchecked-icon="clear"><span class="text-primary text-body2">Allow <b>my
                    community</b> to join</span></q-toggle>

              <q-toggle class="q-mb-md" v-model="formData.allowEveryone" checked-icon="check" color="primary"
                unchecked-icon="clear"><span class="text-primary text-body2">Allow <b>everyone</b> to
                  join</span></q-toggle>
            </div>

            <q-btn v-if="isRequest" :disable="!currentAge" label="Continue" color="primary" class="q-mt-md full-width"
              @click="nextStepSetAge" />

            <q-btn v-if="!isRequest" label="Continue" color="primary" class="q-mt-md full-width" @click="nextStep"
              :disable="!formData.minAge || !formData.maxAge || formData.minAge > formData.maxAge" />
          </div>
        </q-step>

        <!-- Step 6: Post -->
        <q-step :name="6" title="Post" icon="send">
          <div>
            <div class="col text-h4 text-primary lora text-weight-bold">{{ isRequest ?
              'Post Your Request!' : 'Post Your Offering!' }}</div>
            <div class="text-body2 text-primary-80 q-mb-md">
              Review your details and post your learning {{ isRequest ? 'request' : 'offering' }}.
            </div>
            <q-list>
              <q-item v-for="item in formattedSummary" :key="item.label">
                <q-item-section avatar>
                  <q-icon :color="item.iconColor" :name="item.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-body2 text-primary">{{ item.label }}</q-item-label>
                  <q-item-label caption class="text-body2 text-primary-80">
                    {{ item.value.length > 66 ? `${item.value.substring(0, 66)}...` : item.value }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-btn color="primary" class="q-mt-md full-width" @click="postLearningOffering">
              Post Learning {{ isRequest ? 'Request' : 'Offering' }}
            </q-btn>
          </div>
        </q-step>

      </q-stepper>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useLearningsStore } from "../stores/learnings-store";
import { useAuthCommunityStore } from 'src/stores/auth-community-store';
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { onMounted } from 'vue';

const $q = useQuasar();
const router = useRouter();
const addLearningsStore = useLearningsStore();
const authStore = useAuthCommunityStore();

// The route parameter
const props = defineProps({
  isRequest: {
    type: Boolean,
    required: true,
  },
});

onMounted(() => {
  console.log(`Add page loaded with type: ${props.isRequest}`);
});

const step = ref(1);
const formData = ref({
  title: '',
  date: '',
  specificTime: false,
  timeOption: '',
  specificFormat: false,
  timeOfDay: '',
  duration: '',
  location: '',
  formats: [],
  details: '',
  cost: 0,
  costDescription: '',
  minAge: null,
  maxAge: null,
  maxPeople: null,
  allowCommunity: true,
  allowEveryone: false,
  additionalRequirements: false,
  requirements: '',
});

const learningFormats = [
  { text: "Company Tour", icon: "o_tour" },
  { text: "Expert Advice", icon: "o_verified" },
  { text: "Guest Lesson", icon: "o_school" },
  { text: "Hands-On Workshop", icon: "o_build" },
  { text: "Job Shadowing", icon: "o_visibility" },
  { text: "Lesson Series", icon: "o_library_books" },
  { text: "Mentoring/Coaching", icon: "o_supervisor_account" },
  { text: "Online Lesson", icon: "o_cast_for_education" },
  { text: "Q&A", icon: "o_contact_support" },
].sort((a, b) => a.text.localeCompare(b.text));


const timesOfDay = [
  { label: 'Morning', value: 'morning', icon: 'brightness_5' },
  { label: 'Midday', value: 'midday', icon: 'brightness_6' },
  { label: 'Afternoon', value: 'afternoon', icon: 'brightness_7' },
  { label: 'Evening', value: 'evening', icon: 'nights_stay' },
];

const locationOption = ref(null);
const areCosts = ref(false);


const formattedSummary = computed(() => {
  const data = [
    { label: 'Title', value: formData.value.title, icon: 'title', iconColor: 'primary' },
    { label: 'Date', value: formData.value.date || 'Not specified', icon: 'event', iconColor: 'primary' },
    { label: 'Duration', value: formData.value.duration || 'Not specified', icon: 'schedule', iconColor: 'primary' },
    { label: 'Location', value: formData.value.location || 'Not specified', icon: 'location_on', iconColor: 'primary' },
    { label: 'Formats', value: formData.value.formats.join(', ') || 'Not specified', icon: 'widgets', iconColor: 'primary' },
    { label: 'Details', value: formData.value.details || 'Not specified', icon: 'description', iconColor: 'primary' },
    {
      label: 'Costs',
      value: '€' + formData.value.cost + '/person, ' + formData.value.costDescription,
      icon: 'euro_symbol',
      iconColor: 'primary',
    },
    {
      label: props.isRequest ? 'Your Age' : 'Age Range and limit',
      value: props.isRequest
        ? currentAge.value ? `${currentAge.value}` : 'Not specified'
        : formData.value.minAge && formData.value.maxAge
          ? `${formData.value.minAge} - ${formData.value.maxAge}, max ${formData.value.maxPeople} people`
          : 'Not specified',
      icon: 'cake',
      iconColor: 'primary',
    },
    { label: 'Allow Community', value: formData.value.allowCommunity ? 'Yes' : 'No', icon: 'group', iconColor: 'primary' },
    { label: 'Allow Everyone', value: formData.value.allowEveryone ? 'Yes' : 'No', icon: 'public', iconColor: 'primary' },
    { label: 'Requirements', value: formData.value.requirements || 'None', icon: 'rule', iconColor: 'primary' },
  ];

  return data.filter(item => item.value !== 'Not specified');
});

function nextStep() {
  if (step.value < 6) step.value++;
  else postLearningOffering();
}

function prevStep() {
  if (step.value > 1) step.value--;
}

function nextStepSetAge() {
  if (props.isRequest) {
    if (currentAge.value) {
      formData.value.minAge = currentAge.value - 2;
      formData.value.maxAge = currentAge.value + 2;
    } else {
      $q.notify({
        type: "negative",
        message: "Please enter your age before continuing.",
      });
      return;
    }
  }
  console.log(`Age range: ${formData.value.minAge} - ${formData.value.maxAge}`);
  nextStep();
}

function selectTimeOption(option) {
  formData.value.timeOption = option;
  formData.value.date = "";
}

function resetTimeSelection() {
  formData.value.timeOption = null;
  formData.value.date = '';
  formData.value.specificTime = false;
  formData.value.timeOfDay = '';
  formData.value.duration = '';
}


function selectTimeOfDay(value) {
  formData.value.timeOfDay = value;
}

function toggleFormat(format) {
  const index = formData.value.formats.indexOf(format);
  if (index > -1) formData.value.formats.splice(index, 1);
  else formData.value.formats.push(format);
}

function closePage() {
  router.push("/people");
}

const onDateDialog = ref(false);

function openOnDateDialog(selection) {
  onDateDialog.value = true;
  formData.value.timeOption = selection;
}

function saveOnDate() {
  onDateDialog.value = false;
}

function formatDate(date) {
  if (!date) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
}

const durationOptions = [
  { label: '15 min', value: '00:15' },
  { label: '30 min', value: '00:30' },
  { label: '1 hour', value: '01:00' },
  { label: '2 hours', value: '02:00' },
  { label: '3 hours', value: '03:00' },
  { label: '4 hours', value: '04:00' },
  { label: '+4 hours', value: '04:01' },
];

function updateDuration(value) {
  formData.value.duration = value.value;
}


const locationDialog = ref(false);

function selectLocationOption(option) {
  locationOption.value = option;
  formData.value.location = option;
}

function openLocationDialog() {
  locationDialog.value = true;
  formData.value.location = '';
  locationOption.value = 'inPerson';
}

function saveLocation() {
  locationDialog.value = false;
}

function resetLocationSelection() {
  locationOption.value = null;
  formData.value.location = '';
}

const currentAge = ref();

async function postLearningOffering() {
  try {
    const communityId = authStore.profile?.currentCommunityId;
    if (!communityId) {
      throw new Error("Community not selected.");
    }

    const learningData = {
      ...formData.value,
      communityId,
      stage: 'posted',
      userId: authStore.user?.uid,
      isRequest: props.isRequest  // Distinguish between request and offering
    };

    await addLearningsStore.addLearningItem(learningData);

    $q.notify({
      type: "positive",
      message: `Learning ${props.isRequest.value ? "request" : "offering"} posted successfully!`,
    });

    // Reset form
    formData.value = {
      title: "",
      date: "",
      specificTime: false,
      specificFormat: false,
      timeOfDay: "",
      duration: "",
      location: "",
      formats: [],
      details: "",
      cost: 0,
      costDescription: "",
      minAge: null,
      maxAge: null,
      maxPeople: null,
      allowCommunity: true,
      allowEveryone: false,
      additionalRequirements: false,
      requirements: "",
    };

    router.push("/mylearnings");

  } catch (error) {
    console.error("Error posting learning offering:", error.message);
    $q.notify({
      type: "negative",
      message: error.message || "Failed to post learning offering.",
    });
  }
}


</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
