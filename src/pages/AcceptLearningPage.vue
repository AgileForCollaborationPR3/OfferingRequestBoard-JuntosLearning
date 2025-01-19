<template>
  <q-page v-if="learningItem" class="bg-lpage">
    <!-- Fixed Top Header -->
    <q-toolbar class="bg-lpage text-primary" flat>
      <q-btn flat round dense icon="arrow_back" @click="goBack" />
      <q-toolbar-title class="lora text-h6 text-weight-bold text-center">
        {{ learningItem?.type === 'request' ? 'Offer to Help' : 'Join Now' }}
      </q-toolbar-title>
    </q-toolbar>

    <!-- Content Section -->
    <div class="q-mx-md bg-white q-px-md q-py-md" :style="{ minHeight: 'Calc(100vh - 124px)', borderRadius: '20px' }">
      <!-- Text Input -->
      <div class="text-body1 text-primary text-weight-bold q-mb-md">
        {{ learningItem?.isRequest
          ? 'Why are you interested to teach this? What do you have in mind?'
          : 'Why are you interested to learn or join this? What expectations do you have?' }}
      </div>
      <q-input v-model="reason" outlined type="textarea" dense :placeholder="learningItem?.isRequest
        ? 'I am great at this activity ... . What about an in-person lesson of 2 hours at your school?'
        : 'I am really interested to join this activity because ... .'" />

      <!-- For Requests: Confirm Inputs -->
      <div class="text-body1 text-primary text-weight-bold q-pt-md">
        Set your Offering Preferences
      </div>
      <div v-if="learningItem?.type === 'request'">
        <q-list>
          <!-- Date Field -->
          <q-item active-class="bg-accent" :active="timeOption === 'flexible' || timeOption === 'beforeDate'">
            <q-item-section avatar>
              <q-icon name="event" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-body2 text-primary">
                {{ dateLabel }}
              </q-item-label>
              <q-item-label caption class="text-body2 text-primary-80">
                {{ formattedDate }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn icon="edit" flat round color="primary" @click="toggleDateDialog" />
            </q-item-section>
          </q-item>

          <!-- Date Editor Dialog -->
          <q-dialog v-model="editMode.date">
            <q-card style="min-width: 80vw; border-radius: 20px;">
              <q-card-section>
                <div class="row items-center justify-between">
                  <div class="text-h6 text-primary">Edit Date</div>
                  <q-btn flat round dense icon="close" @click="toggleDateDialog" />
                </div>
              </q-card-section>
              <q-card-section>
                <q-date v-model="selectedDate" mask="YYYY-MM-DD" :default-year="new Date().getFullYear()"
                  :default-month="new Date().getMonth() + 1" />
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Save" color="primary" @click="saveDate" />
              </q-card-actions>
            </q-card>
          </q-dialog>


          <!-- Time of Day Field -->
          <q-item v-if="learningItem?.specificTime">
            <q-item-section avatar>
              <q-icon name="schedule" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-body2 text-primary">
                Preferred Time of Day
              </q-item-label>
              <q-item-label caption class="text-body2 text-primary-80">
                {{ timeOfDayLabel }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn icon="edit" flat round color="primary" @click="editTimeOfDay" />
            </q-item-section>
          </q-item>

          <!-- Time of Day Editor Dialog -->
          <q-dialog v-model="editMode.timeOfDay">
            <q-card style="min-width: 80vw; border-radius: 20px;">
              <q-card-section>
                <div class="row items-center justify-between">
                  <div class="text-h6 text-primary">Edit Preferred Time of Day</div>
                </div>
              </q-card-section>
              <q-card-section>
                <div class="col-5 q-px-sm q-pb-md" v-for="option in timeOfDayOptions" :key="option.value">
                  <q-btn class="full-width" :icon="option.icon" clickable @click="setTimeOfDay(option.value)"
                    :color="learningItem.value?.timeOfDay === option.value ? 'primary' : 'accent'"
                    :text-color="learningItem.value?.timeOfDay === option.value ? 'accent' : 'primary'" stack>
                    <span v-if="option.value === 'morning'" class="q-pt-sm" style="line-height:0.7">Morning <br> <span
                        class="text-caption">9 - 12</span></span>
                    <span v-if="option.value === 'midday'" class="q-pt-sm" style="line-height:0.7">Midday <br> <span
                        class="text-caption">12 - 14</span></span>
                    <span v-if="option.value === 'afternoon'" class="q-pt-sm" style="line-height:0.7">Afternoon <br>
                      <span class="text-caption">14 - 16</span></span>
                    <span v-if="option.value === 'evening'" class="q-pt-sm" style="line-height:0.7">Evening <br> <span
                        class="text-caption">16 - 20</span> <span class="text-caption">12
                        -
                        14</span></span>
                  </q-btn>
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Close" color="primary" @click="toggleTimeOfDayDialog" />
              </q-card-actions>
            </q-card>
          </q-dialog>


          <!-- Duration Field -->
          <q-item :active="!learningItem?.duration" active-class="bg-accent">
            <q-item-section avatar>
              <q-icon name="timelapse" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-body2 text-primary">
                {{ durationLabel }}
              </q-item-label>
              <q-item-label caption class="text-body2 text-primary-80">
                {{ durationOptions.find(opt => opt.value === learningItem?.duration)?.label
                  || 'Edit to indicate a duration' }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn icon="edit" flat round color="primary" @click="editDuration" />
            </q-item-section>
          </q-item>

          <!-- Duration Edit Dialog -->
          <q-dialog v-model="editMode.duration">
            <q-card style="min-width: 80vw; border-radius: 20px;">
              <q-card-section>
                <div class="row items-center justify-between">
                  <div class="text-h6 text-primary">Edit Duration</div>
                  <q-btn flat round dense icon="close" @click="toggleDurationDialog" />
                </div>
              </q-card-section>
              <q-card-section>
                <q-select v-model="selectedDuration" :options="durationOptions" label="Duration" outlined dense
                  class="q-mt-md" />
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Save" color="primary" @click="saveDuration" />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <!-- Location Field -->
          <q-item :active="learningItem?.location === 'flexible'" active-class="bg-accent">
            <q-item-section avatar>
              <q-icon name="location_on" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-body2 text-primary">
                {{ locationLabel }}
              </q-item-label>
              <q-item-label caption class="text-body2 text-primary-80">
                {{ locationValue }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn icon="edit" flat round color="primary" @click="editLocation" />
            </q-item-section>
          </q-item>

          <!-- Location Edit Dialog -->
          <q-dialog v-model="editMode.location">
            <q-card style="min-width: 80vw; border-radius: 20px;">
              <q-card-section>
                <div class="text-h6 text-primary">Set Location</div>
              </q-card-section>

              <q-card-section>
                <div v-if="!selectedLocation || selectedLocation === 'inPerson'" class="row justify-center">
                  <q-btn class="col-9 q-my-sm" :text-color="selectedLocation === 'online' ? 'accent' : 'primary'"
                    :color="selectedLocation === 'online' ? 'primary' : 'accent'" @click="selectLocation('online')"
                    no-caps>
                    Online
                  </q-btn>
                  <q-btn class="col-9 q-my-sm" :text-color="selectedLocation === 'inPerson' ? 'accent' : 'primary'"
                    :color="selectedLocation === 'inPerson' ? 'primary' : 'accent'"
                    @click="selectedLocation = 'inPerson'" no-caps>
                    <div>{{ selectedLocation === 'inPerson' && locationValue ? 'In Person:' : 'In Person' }}</div>
                    <div v-if="selectedLocation === 'inPerson' && locationValue" class="full-width">{{ locationValue }}
                    </div>
                  </q-btn>
                  <!--<q-btn class="col-9 q-my-sm" :text-color="selectedLocation === 'flexible' ? 'accent' : 'primary'"
                    :color="selectedLocation === 'flexible' ? 'primary' : 'accent'" @click="selectLocation('flexible')"
                    no-caps>
                    I'm Flexible
                  </q-btn>-->
                </div>
                <div v-else>
                  <q-input v-model="locationInput" label="Location Address" outlined dense filled prefix-icon="place" />
                </div>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn flat label="Cancel" color="negative" @click="toggleLocationDialog" />
                <q-btn flat label="Save" color="primary" @click="saveLocation" />
              </q-card-actions>
            </q-card>
          </q-dialog>


          <!-- Max People Field -->
          <q-item>
            <q-item-section avatar>
              <q-icon name="group" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-body2 text-primary">
                Maximum Participants
              </q-item-label>
              <q-item-label caption class="text-body2 text-primary-80">
                {{ maxPeopleValue }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn icon="edit" flat round color="primary" @click="editMaxPeople" />
            </q-item-section>
          </q-item>

          <!-- Max People Edit Dialog -->
          <q-dialog v-model="editMode.maxPeople">
            <q-card style="min-width: 80vw; border-radius: 20px;">
              <q-card-section>
                <div class="text-h6 text-primary">Set Maximum Participants</div>
              </q-card-section>

              <q-card-section>
                <q-input v-model.number="maxParticipantsInput" label="Maximum Participants" type="number" outlined dense
                  filled prefix-icon="group" min="1" />
              </q-card-section>

              <q-card-actions align="right">
                <q-btn flat label="Cancel" color="negative" @click="toggleMaxPeopleDialog" />
                <q-btn flat label="Save" color="primary" @click="saveMaxParticipants" />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </q-list>
      </div>

      <!-- Bottom Button -->
      <q-btn :label="learningItem?.type === 'request' ? 'Submit Offer' : 'Confirm Participation'" color="primary"
        class="q-mt-md full-width" :disable="hasIncompleteFields" @click="submit" />
    </div>
  </q-page>
  <div v-else class="q-pa-md text-center">
    <q-spinner color="primary" size="50px" />
    <div class="text-body2 text-primary q-mt-sm">Loading...</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useLearningsStore } from '../stores/learnings-store';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { formatDateShort } from '../utils/formatDate';
import { useAuthCommunityStore } from 'src/stores/auth-community-store';

// Initialize Quasar, Router, and Store
const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const learningsStore = useLearningsStore();
const authStore = useAuthCommunityStore(); // Access user information

// Fetch learning item
const learningItemId = route.params.id;
const learningItem = ref(null);

// Form state variables
const reason = ref('');
const timeOption = ref(null);
const formattedDate = ref('');
const otherFields = ref([]);
const selectedDate = ref(null); // Temporary variable for date editing
const fallbackDate = ref(new Date().toISOString().split('T')[0]); // Fallback to today's date
const timeOfDayOptions = [
  { label: 'Morning', value: 'morning', icon: 'brightness_5' },
  { label: 'Midday', value: 'midday', icon: 'brightness_6' },
  { label: 'Afternoon', value: 'afternoon', icon: 'brightness_7' },
  { label: 'Evening', value: 'evening', icon: 'nights_stay' },
];
const durationOptions = [
  { label: '15 min', value: '00:15' },
  { label: '30 min', value: '00:30' },
  { label: '1 hour', value: '01:00' },
  { label: '2 hours', value: '02:00' },
  { label: '3 hours', value: '03:00' },
  { label: '4 hours', value: '04:00' },
  { label: '+4 hours', value: '04:01' },
];
const selectedDuration = ref(null);
const selectedLocation = ref(null);
const locationInput = ref('');
const maxParticipantsInput = ref(1);

const editMode = ref({
  date: false,
  timeOfDay: false,
  duration: false,
  location: false,
  maxPeople: false
});

// Toggle dialog visibility
function toggleDateDialog() {
  if (!learningItem.value) {
    $q.notify({ type: 'negative', message: 'Data is still loading. Please wait.' });
    return;
  }
  if (editMode.value.date) {
    selectedDate.value = learningItem.value.date || fallbackDate.value; // Reset to current date or fallback
  }
  editMode.value.date = !editMode.value.date;
}

function toggleTimeOfDayDialog() {
  editMode.value.timeOfDay = !editMode.value.timeOfDay;
}

function toggleDurationDialog() {
  if (!learningItem.value) {
    $q.notify({ type: 'negative', message: 'Data is still loading. Please wait.' });
    return;
  }
  if (editMode.value.duration) {
    selectedDuration.value = learningItem.value.duration || null; // Reset to current value
  }
  editMode.value.duration = !editMode.value.duration;
}

function toggleLocationDialog() {
  if (!learningItem.value) {
    $q.notify({ type: 'negative', message: 'Data is still loading. Please wait.' });
    return;
  }
  if (editMode.value.location) {
    selectedLocation.value = learningItem.value.location || 'flexible'; // Default to flexible if no location
    locationInput.value = learningItem.value.location === 'inPerson' ? learningItem.value.locationDetails : '';
  }
  editMode.value.location = !editMode.value.location;
}

function toggleMaxPeopleDialog() {
  if (!learningItem.value) {
    $q.notify({ type: 'negative', message: 'Data is still loading. Please wait.' });
    return;
  }
  if (editMode.value.maxPeople) {
    maxParticipantsInput.value = learningItem.value.maxPeople || 1; // Default to 1 if not set
  }
  editMode.value.maxPeople = !editMode.value.maxPeople;
}



// Save changes
function saveDate() {
  if (learningItem.value) {
    learningItem.value.date = selectedDate.value; // Update learning item with the selected date
    formattedDate.value = formatDateShort(selectedDate.value);
    timeOption.value = 'onDate';
  }
  toggleDateDialog();
}

function setTimeOfDay(value) {
  if (learningItem.value) {
    learningItem.value.timeOfDay = value;
  }
  toggleTimeOfDayDialog();
}

function saveDuration() {
  if (learningItem.value) {
    learningItem.value.duration = selectedDuration.value.value; // Update learning item with selected duration
  }
  toggleDurationDialog();
}

function selectLocation(option) {
  selectedLocation.value = option;
  if (option === 'online' || option === 'flexible') {
    learningItem.value.location = option;
    toggleLocationDialog();
    $q.notify({ type: 'positive', message: `Location set to ${option === 'online' ? 'Online' : 'Flexible'}` });
  }
}

function saveLocation() {

  learningItem.value.location = 'inPerson';
  learningItem.value.locationDetails = locationInput.value;
  $q.notify({ type: 'positive', message: `Location set to In Person: ${locationInput.value}` });
  toggleLocationDialog();
}

function saveMaxParticipants() {
  if (maxParticipantsInput.value < 1) {
    $q.notify({ type: 'negative', message: 'Please enter a valid number greater than 0.' });
    return;
  }
  learningItem.value.maxPeople = maxParticipantsInput.value;
  $q.notify({ type: 'positive', message: `Maximum participants set to ${maxParticipantsInput.value}` });
  toggleMaxPeopleDialog();
}

// Computed properties
const dateLabel = computed(() => {
  if (!learningItem.value || !learningItem.value.date) return 'Loading...';
  const date = learningItem.value.date.replace(/\//g, '-'); // Normalize date format
  if (timeOption.value === 'flexible') return 'Suggest Date';
  if (timeOption.value === 'beforeDate') return `Pick date before ${formatDateShort(date)}`;
  if (timeOption.value === 'onDate') return 'Will take place on';
  return 'Date is mandatory';
});

const timeOfDayLabel = computed(() => {
  const option = timeOfDayOptions.find(opt => opt.value === learningItem.value?.timeOfDay);
  return option ? option.label : 'Please select a time';
});

const durationLabel = computed(() => {
  return learningItem.value?.duration ? 'Duration' : 'Edit to indicate a duration';
});


const locationLabel = computed(() => {
  const location = learningItem.value?.location;
  if (!location) return 'Loading...';
  if (location === 'online') return 'Online';
  if (location === 'inPerson') return 'In Person';
  return 'Location';
});

const locationValue = computed(() => {
  if (!learningItem.value?.location) return 'Loading...';
  if (learningItem.value.location === 'inPerson') return learningItem.value.locationDetails || 'Edit to specify a location';
  return learningItem.value.location;
});

const maxPeopleValue = computed(() => {
  const maxPeople = learningItem.value?.maxPeople;
  return maxPeople && maxPeople > 0 ? maxPeople : 'Not specified';
});

const hasIncompleteFields = computed(() => {
  // If the learning item is still loading or undefined, consider the fields incomplete
  if (!learningItem.value) {
    return true;
  }

  // Case when learningItem is a request
  if (learningItem.value.isRequest) {
    return (
      !learningItem.value?.date || // Check if date is missing
      !learningItem.value?.duration || // Check if duration is missing
      learningItem.value?.location === 'flexible' || // Check if location is still flexible
      !reason.value // Check if the reason input is empty
    );
  }

  // Case when learningItem is not a request (joining an offer)
  return !reason.value; // Only the reason is required
});


// Fetch learning item data on mount
onMounted(async () => {
  learningItem.value = await learningsStore.getLearningItemById(learningItemId);

  if (learningItem.value) {
    timeOption.value = learningItem.value.timeOption || null;
    formattedDate.value = formatDateShort(learningItem.value.date || fallbackDate.value);
    selectedDate.value = learningItem.value.date || fallbackDate.value;

    otherFields.value = [
      { label: 'Formats', value: learningItem.value.formats.map((f) => f).join(', ') || 'Not specified', icon: 'widgets', iconColor: 'primary' },
      {
        label: 'Costs',
        value: `€${learningItem.value.cost || '0'}/person`,
        icon: 'euro_symbol',
        iconColor: 'primary',
      },
      {
        label: 'Age Range',
        value: `${learningItem.value.minAge || 'N/A'} - ${learningItem.value.maxAge || 'N/A'}`,
        icon: 'cake',
        iconColor: 'primary',
      },
    ];
  }
});

// Edit handlers for other fields
function editTimeOfDay() {
  toggleTimeOfDayDialog();
}

function editDuration() {
  toggleDurationDialog();
}

function editLocation() {
  toggleLocationDialog();
}

function editMaxPeople() {
  toggleMaxPeopleDialog();
}

// Submit handler

async function submit() {
  if (!reason.value) {
    $q.notify({ type: 'negative', message: 'Please provide your reason before submitting.' });
    return;
  }

  const userId = authStore.user?.uid;

  if (!userId) {
    $q.notify({ type: 'negative', message: 'You must be logged in to submit.' });
    return;
  }

  const isRequest = learningItem.value?.isRequest;

  const submissionData = {
    learningId: learningItemId,
    userId,
    reason: reason.value,
    createdAt: new Date().toISOString(),
  };

  try {
    if (isRequest) {
      // Handle "Offer to Help"
      submissionData.preferences = {
        date: learningItem.value?.date,
        timeOfDay: learningItem.value?.timeOfDay,
        duration: learningItem.value?.duration,
        location: learningItem.value?.location,
        locationDetails: learningItem.value?.location === 'inPerson' ? learningItem.value?.locationDetails : null,
        maxPeople: learningItem.value?.maxPeople,
      };
      await learningsStore.addOffer(submissionData);
      $q.notify({ type: 'positive', message: 'Your offer has been submitted successfully!' });
    } else {
      // Handle "Join Now"
      await learningsStore.joinOffer(submissionData);
      $q.notify({ type: 'positive', message: 'Successfully joined the learning offering!' });
    }
    router.push('/mylearnings');
  } catch (error) {
    console.error('Error submitting:', error);
    $q.notify({ type: 'negative', message: 'Failed to submit. Please try again later.' });
  }
}


// Navigation handler
function goBack() {
  router.back();
}
</script>



<style scoped>
.q-btn {
  border-radius: 20px;
}
</style>
