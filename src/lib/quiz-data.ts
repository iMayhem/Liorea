// src/lib/quiz-data.ts
import type { Question } from './types';

export const nlmQuestions: Question[] = [
  {
    questionNumber: 1,
    questionText:
      'When a train stops suddenly, passengers in the running train feel an instant jerk in the forward direction because:',
    questionImageURL: '',
    options: {
      A: 'The back of seat suddenly pushes the passengers forward.',
      B: 'Inertia of rest stops the train and takes the body forward.',
      C: 'Upper part of the body continues to be in the state of motion whereas the lower part of the body in contact with seat remains at rest.',
      D: 'Nothing can be said due to insufficient data.',
    },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 2,
    questionText: 'A man getting down from a running bus falls forward because:',
    questionImageURL: '',
    options: {
      A: 'Due to inertia of rest, road is left behind and man reaches forward.',
      B: 'Due to inertia of motion upper part of body continues to be in motion in forward direction while feet come to rest as soon as they touch the road.',
      C: 'He leans forward as a matter of habit.',
      D: 'Of the combined effect of all the three factors stated in (1), (2) and (3).',
    },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 3,
    questionText: "Newton's first law of motion describes the following:",
    questionImageURL: '',
    options: {
      A: 'Energy',
      B: 'Work',
      C: 'Inertia',
      D: 'Moment of inertia',
    },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 4,
    questionText:
      'A particle is moving with a constant speed along a straight line path. A force is not required to:',
    questionImageURL: '',
    options: {
      A: 'Increase its speed',
      B: 'Decrease the momentum',
      C: 'Change the direction',
      D: 'Keep it moving with uniform velocity',
    },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 5,
    questionText:
      'You are on a frictionless horizontal plane. How can you get off if no horizontal force is exerted by pushing against the surface:',
    questionImageURL: '',
    options: {
      A: 'By jumping',
      B: 'By spitting or sneezing',
      C: 'By rolling your body on the surface',
      D: 'By running on the plane',
    },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 6,
    questionText:
      'Let E, G and N represents the magnitude of electromagnetic, gravitational and nuclear forces between two protons at a given separation (1 fermi = 10⁻¹⁵ m). Then',
    questionImageURL: '',
    options: { A: 'N < E < G', B: 'E > N > G', C: 'G > N > E', D: 'N > E > G' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 7,
    questionText: "Newton's Third law is equivalent to the-",
    questionImageURL: '',
    options: {
      A: 'law of conservation of linear momentum',
      B: 'law of conservation of angular momentum',
      C: 'law of conservation of energy',
      D: 'law of conservation of energy and mass',
    },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 8,
    questionText: 'A cannon after firing recoils due to-',
    questionImageURL: '',
    options: {
      A: 'Conservation of energy',
      B: 'Backward thrust of gases produced',
      C: "Newton's third law of motion",
      D: "Newton's first law of motion",
    },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 9,
    questionText:
      'A ball weighing 10 gm hits a hard surface vertically with a speed of 5 m/s and rebounds with the same speed. The ball remain in contact with the surface for 0.01 sec. The average force exerted by the surface on the ball is:',
    questionImageURL: '',
    options: { A: '100 N', B: '10 N', C: '1 N', D: '150 N' },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 10,
    questionText: "We can derive newton's-",
    questionImageURL: '',
    options: {
      A: 'second and third laws from the first law',
      B: 'first and second laws from the third law',
      C: 'third and first laws from the second law',
      D: 'all the three laws are independent of each other',
    },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 11,
    questionText:
      'A boy sitting on the topmost berth in the compartment of a train which is just going to stop on a railway station, drops an apple aiming at the open hand of his brother sitting vertically below his hands at a distance of about 2 meter. The apple will fall:',
    questionImageURL: '',
    options: {
      A: 'Precisely on the hand of his brother.',
      B: 'Slightly away from the hand of his brother in the direction of motion of the train.',
      C: 'Slightly away from the hand of his brother in the direction opposite to the direction of motion of the train.',
      D: 'None of the above',
    },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 12,
    questionText:
      'A 1 kg particle strikes a wall with velocity 1 m/s at an angle of 30° with the normal to the wall and reflects at the same angle. If it remain in contact with wall for 0.1 s, then the force is-',
    questionImageURL: '',
    options: { A: '0', B: '10√3 N', C: '30√3 N', D: '40√3 N' },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 13,
    questionText:
      'A body of 2 kg has an initial speed 5 ms⁻¹. A force acts on it for some time in the direction of motion. The force time graph is shown in figure. The final speed of the body.',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q13_image.png?alt=media&token=3b5b293e-25c2-4a41-863a-23d9b4184617',
    options: { A: '9.8 ms⁻¹', B: '5 ms⁻¹', C: '14.31 ms⁻¹', D: '4.25 ms⁻¹' },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 14,
    questionText:
      'A body of mass 3 kg is acted on by a force which varies as shown in the graph below. The momentum acquired is given by:',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q14_image.png?alt=media&token=30b80e5b-21d3-4f93-9562-1b1513253b75',
    options: { A: 'Zero', B: '5 N-s', C: '30 N-s', D: '50 N-s' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 15,
    questionText:
      'A disc of mass 1.0 kg kept floating horizontally in air by firing bullets of mass 0.05 kg each vertically at it, at the rate of 10 per second. If the bullets rebound with the same speed, the speed with which these are fired will be-',
    questionImageURL: '',
    options: { A: '0.098 m/s', B: '0.98 m/s', C: '9.8 m/s', D: '98.0 m/s' },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 16,
    questionText:
      'A machine gun fires bullets of 50 gm at the speed of 1000 m/sec. If an average force of 200 N is exerted on the gun, the maximum number of bullets fired per minute is:',
    questionImageURL: '',
    options: { A: '240', B: '120', C: '60', D: '30' },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 17,
    questionText:
      'As an inclined plane is made slowly horizontal by reducing the value of angle θ with horizontal, the component of weight parallel to the plane of a block resting on the inclined plane-',
    questionImageURL: '',
    options: {
      A: 'decreases',
      B: 'remains same',
      C: 'increases',
      D: 'increases if the plane is smooth',
    },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 18,
    questionText:
      'A block of mass m is placed on a smooth inclined plane of inclination θ with the horizontal. The force exerted by the plane on the block has a magnitude',
    questionImageURL: '',
    options: { A: 'mg', B: 'mg/cosθ', C: 'mg cosθ', D: 'mg tanθ' },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 19,
    questionText:
      'Two blocks are in contact on a frictionless table. One has mass m and the other 2m. A force F is applied on 2m as shown in the figure. Now the same force F is applied from the right on m. In the two cases respectively, the ratio of force of contact between the two blocks will be:',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q19_image.png?alt=media&token=8544c688-3c81-423c-974a-471d87e07a34',
    options: { A: 'same', B: '1:2', C: '2:1', D: '1:3' },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 20,
    questionText:
      'Two forces of 6N and 3N are acting on the two blocks of 2kg and 1kg kept on frictionless floor. What is the force exerted on 2kg block by 1kg block?',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q20_image.png?alt=media&token=96357067-17de-49c2-9014-41d5083a2164',
    options: { A: '1N', B: '2N', C: '4N', D: '5N' },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 21,
    questionText:
      'A body of mass 40 gm is moving with a constant velocity of 2 cm/sec on a horizontal frictionless table. The force on the table is-',
    questionImageURL: '',
    options: { A: '39200 dyne', B: '160 dyne', C: '80 dyne', D: 'zero dyne' },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 22,
    questionText:
      'If the tension in the cable of 1000 kg elevator is 1000 kg weight, the elevator',
    questionImageURL: '',
    options: {
      A: 'is accelerating, upwards',
      B: 'is accelerating downwards',
      C: 'may be at rest or accelerating',
      D: 'may be at rest or in uniform motion',
    },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 23,
    questionText:
      'An elevator weighing 3000 kg is pulled upwards by a cable with an acceleration of 5 ms⁻². Taking g to be 10 ms⁻². Then the tension in the cable is-',
    questionImageURL: '',
    options: { A: '6000 N', B: '9000 N', C: '60000 N', D: '45000 N' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 24,
    questionText:
      'Three blocks are connected as shown in fig., on a horizontal frictionless table and pulled to the right with a force T₃ = 60 N. If m₁=10 kg, m₂=20 kg, and m₃=30 kg, the tension T₂ is-',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q24_image.png?alt=media&token=c1935665-27a9-467a-8d19-21b369527e0c',
    options: { A: '10 N', B: '20 N', C: '30 N', D: '60 N' },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 25,
    questionText:
      'A uniform thick rope of length 5m is kept on frictionless surface and a force of 5N is applied to one of its end. Find tension in the rope at 1m from this end-',
    questionImageURL: '',
    options: { A: '1N', B: '3N', C: '4N', D: '5N' },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 26,
    questionText:
      'Two persons are holding a rope of negligible weight tightly at its ends so that it is horizontal. A 15 kg weight is attached to the rope at the mid point which now no longer remains horizontal. The minimum tension required to completely straighten the rope is:',
    questionImageURL: '',
    options: {
      A: '15 kg',
      B: '15/2 kg',
      C: '5 kg',
      D: 'Infinitely large',
    },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 27,
    questionText:
      'A boy of mass 40 kg is hanging from the horizontal branch of a tree. The tension in his arms is minimum when the angle between the arms is:',
    questionImageURL: '',
    options: { A: '0°', B: '90°', C: '120°', D: '180°' },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 28,
    questionText:
      'A chain of mass M and length L held vertical by fixing its upper end to a rigid support. The tension in the chain at a distance y from the rigid support is:',
    questionImageURL: '',
    options: { A: 'Mg', B: 'Mg(L-y)/L', C: 'MgL/(L-y)', D: 'Mgy/4' },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 29,
    questionText:
      "Ten one rupees coins are put on top of each other on a table. Each coin has a mass 'm' kg., then the force on the 7th coin (counted from the bottom) due to all the coins on its top is:",
    questionImageURL: '',
    options: { A: '3 mg', B: '7 mg', C: '2 mg', D: '5 mg' },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 30,
    questionText:
      'In a tug of war each of the two teams apply 1000 Newton force at the ends of a rope, which is found to be in equilibrium, the tension in the rope is-',
    questionImageURL: '',
    options: { A: '2000 newton', B: '1000 newton', C: '500 newton', D: 'zero' },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 31,
    questionText:
      'A light string passes over a frictionless pulley. To one of its ends a mass of 6 kg is attached and to its other end a mass of 10 kg is attached. The tension in the string will be -',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q31_image.png?alt=media&token=c2c1a84f-e22a-4a25-a131-7e8c75ab8b18',
    options: { A: '50 N', B: '75 N', C: '100 N', D: '150 N' },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 32,
    questionText: 'Essential characteristic of translational equilibrium is-',
    questionImageURL: '',
    options: {
      A: 'its momentum is equal to zero',
      B: 'its acceleration is equal to zero',
      C: 'its kinetic energy equal to zero',
      D: 'a single force acts on it',
    },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 33,
    questionText:
      'A mass M is suspended by a rope from a rigid support at A as shown in figure. Another rope is tied at the end B, and it is pulled horizontally with a force F. If the rope AB makes an angle θ with the vertical in equilibrium, then the tension in the string AB is:',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q33_image.png?alt=media&token=b736b761-0b5c-44c1-8404-58a25c156f70',
    options: { A: 'F sinθ', B: 'F/sinθ', C: 'F cosθ', D: 'F/cosθ' },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 34,
    questionText:
      'A uniform string mass 6 kg and length L is suspended from a rigid support. The tension at a distance L/4 from the free end is:',
    questionImageURL: '',
    options: { A: '6 kg-wt', B: '1.5 kg-wt', C: '4.5 kg-wt', D: 'zero' },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 35,
    questionText:
      'A block of mass 0.2 kg is suspended from the ceiling by a light string. A second block of mass 0.3 kg is suspended from the first block through another string. The tensions in the two strings: Take g = 10 m/s².',
    questionImageURL: '',
    options: {
      A: 'T₁=5 N, T₂=3 N',
      B: 'T₁=4 N, T₂=3 N',
      C: 'T₁=5 N, T₂=5 N',
      D: 'T₁=3 N, T₂=3 N',
    },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 36,
    questionText:
      'An object is subjected to a force in the north-east direction. To balance this force, a second force should be applied in the direction:',
    questionImageURL: '',
    options: { A: 'North-East', B: 'South', C: 'South-west', D: 'West' },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 37,
    questionText:
      'Two forces with equal magnitudes F act on a body and the magnitude of the resultant force is F/3. The angle between the two forces is:',
    questionImageURL: '',
    options: {
      A: 'cos⁻¹(-17/18)',
      B: 'cos⁻¹(-1/3)',
      C: 'cos⁻¹(2/3)',
      D: 'cos⁻¹(8/9)',
    },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 38,
    questionText:
      'A force of 6N acts on a body at rest of mass 1 kg. During this time, the body attains a velocity of 30 m/s. The time for which the force acts on the body is-',
    questionImageURL: '',
    options: { A: '10 seconds', B: '8 seconds', C: '7 seconds', D: '5 seconds' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 39,
    questionText:
      'A 10 kg wagon is pushed with a force of 7N for 1.5 second, then with a force of 5 N for 1.7 seconds, and then with a force of 10 N for 3 second in the same direction. What is the change in velocity brought about?',
    questionImageURL: '',
    options: { A: '9.8 m/s', B: '19.6 m/s', C: '4.9 m/s', D: '10 m/s' },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 40,
    questionText:
      'When a constant force is applied to a body, it moves with uniform:',
    questionImageURL: '',
    options: {
      A: 'acceleration',
      B: 'velocity',
      C: 'speed',
      D: 'momentum',
    },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 41,
    questionText:
      'The linear momentum P of a body varies with time and is given by the equation P = A + Bt². where A and B are constants. The net force acting on the body for a one dimensional motion is proportional to-',
    questionImageURL: '',
    options: { A: 't²', B: 'a constant', C: 't³', D: 't' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 42,
    questionText:
      'Two masses of 5 kg and 10 kg are connected to a pulley as shown. What will be the acceleration if the pulley is set free? [g = acceleration due to gravity]',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q42_image.png?alt=media&token=c41f92e5-4f47-4a7b-a012-70b97931c3e3',
    options: { A: 'g', B: 'g/2', C: 'g/3', D: 'g/4' },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 43,
    questionText:
      'Two bodies of 5 kg and 4 kg are tied to a string as shown in the fig. If the table and pulley both are smooth, acceleration of 5 kg body will be equal to-',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q43_image.png?alt=media&token=6f212264-b05c-43f6-8051-512599763784',
    options: { A: 'g', B: 'g/4', C: '4g/9', D: '5g/9' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 44,
    questionText:
      "The ratio of the weight of a man in a stationary lift & when it is moving downward with uniform acceleration 'a' is 3:2. The value of 'a' is:",
    questionImageURL: '',
    options: { A: '(3/2)g', B: 'g', C: '(2/3)g', D: 'g/3' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 45,
    questionText:
      'A spring toy weighing 1 kg on a spring balance suddenly jumps upward. A boy standing near the toy notices that the scale of the balance reads 1.05 kg. In this process the maximum acceleration of the toy is- (g=10m sec⁻²)',
    questionImageURL: '',
    options: {
      A: '0.05 m sec⁻²',
      B: '0.5 m sec⁻²',
      C: '1.05 m sec⁻²',
      D: '1 m sec⁻²',
    },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 46,
    questionText:
      'Figure shows a uniform rod of mass 3 kg and of length 30 cm. The strings shown in figure are pulled by constant forces of 20 N and 32 N. The acceleration of the rod is-',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q46_image.png?alt=media&token=f0d7e7e5-1a2c-473c-905c-1c5c06439b1c',
    options: { A: '2 m/s²', B: '3 m/s²', C: '4 m/s²', D: '6 m/s²' },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 47,
    questionText:
      'In the above question tension in rod at a distance 10cm from end A is-',
    questionImageURL: '',
    options: { A: '18N', B: '20N', C: '24N', D: '36N' },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 48,
    questionText:
      'A man weighs 80 kg. He stands on a weighing scale in a lift which is moving upwards with a uniform acceleration of 5 m/s². What would be the reading on the scale- (g=10 m/s²)',
    questionImageURL: '',
    options: { A: '1200 N', B: 'Zero', C: '400 N', D: '100 N' },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 49,
    questionText:
      'An elevator weighing 6000 kg is moving with the constant acceleration of 5 m/s². Taking g to be 10 m/s², then the tension in the cable is-',
    questionImageURL: '',
    options: { A: '6000 N', B: '9000 N', C: '60000 N', D: '90000 N' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 50,
    questionText:
      'A balloon of gross weight w newton is falling vertically downward with a constant acceleration a (< g). The magnitude of the air resistance is:',
    questionImageURL: '',
    options: { A: 'w', B: 'w(1+a/g)', C: 'w(1-a/g)', D: 'wa/g' },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 51,
    questionText:
      'A man is standing at a spring platform. Reading of spring balance is 60 kg wt. If man jumps outside platform, then reading of spring balance-',
    questionImageURL: '',
    options: {
      A: 'First increases then decreases to zero',
      B: 'decreases',
      C: 'increases',
      D: 'remains same',
    },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 52,
    questionText:
      'Three forces P, Q & R are acting at a point in a plane. The angle between P and Q, Q and R are 150° and 120° respectively. Then for equilibrium, forces P, Q & R are in the ratio:',
    questionImageURL: '',
    options: { A: '1:2:3', B: '1:2:√3', C: '3:2:1', D: '√3:2:1' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 53,
    questionText:
      'The mechanical advantage of a wheel axle is 5 what will be the force required to lift a 200 kg wt?',
    questionImageURL: '',
    options: { A: '10 kg-wt', B: '2 kg-wt', C: '20 kg-wt', D: '40 kg-wt' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 54,
    questionText:
      'A block of metal weighing 2 kg is resting on a frictionless plane. It is struck by a jet releasing water at a rate of 1 kg/s and at a speed of 5 m/s. The initial acceleration of the block will be:',
    questionImageURL: '',
    options: {
      A: '2.5 m/s²',
      B: '5 m/s²',
      C: '10 m/s²',
      D: 'None of these',
    },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 55,
    questionText:
      'When forces F₁, F₂, F₃ are acting on a particle of mass m such that F₂ and F₃ are mutually perpendicular, then the particle remains stationary. If the force F₁ is now removed then the acceleration of the particle is-',
    questionImageURL: '',
    options: { A: 'F₁/m', B: 'F₂F₃/mF₁', C: '(F₂-F₃)/m', D: 'F₂/m' },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 56,
    questionText:
      'A sphere of mass m is kept in equilibrium with the help of several springs as shown in the figure. Measurement shows that one of the springs applies a force F on the sphere. With what acceleration the sphere will move immediately after this particular spring is cut?',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q56_image.png?alt=media&token=e907d4b4-d563-47d0-8f96-48c081e7d825',
    options: {
      A: 'zero',
      B: 'F/m',
      C: '-F/m',
      D: 'insufficient information',
    },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 57,
    questionText:
      'A block of weight W is suspended by a string of fixed length. The ends of the string are held at various positions as shown in the figures below. In which case, if any, is the magnitude of the tension along the string largest?',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q57_image.png?alt=media&token=8f8303f2-1a73-45a8-9d41-3b7c0627d3b0',
    options: { A: 'Case (1)', B: 'Case (2)', C: 'Case (3)', D: 'Case (4)' },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 58,
    questionText:
      'A monkey is descending from the branch of a tree with constant acceleration. If the breaking strength of branch is 75% of the weight of the monkey, the minimum acceleration with which the monkey can slide down without breaking the branch is',
    questionImageURL: '',
    options: { A: 'g', B: '3g/4', C: 'g/4', D: 'g/2' },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 59,
    questionText:
      'Two blocks of 7 kg and 5 kg are connected by a heavy rope of mass 4 kg. An upward force of 200N is applied as shown in the diagram. The tension at the top of heavy rope at point P is- (g=10 m/s²)',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q59_image.png?alt=media&token=b7c25143-6cd3-47a3-ab8c-5221051515f4',
    options: { A: '2.27 N', B: '112.5 N', C: '87.5 N', D: '360 N' },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 60,
    questionText:
      "A thief stole a box full of valuable articles of weight W and while carrying it on his back, he jumped down a wall of height 'h' from the ground. Before he reached the ground he experienced a load of:",
    questionImageURL: '',
    options: { A: '2W', B: 'W', C: 'W/2', D: 'Zero' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 61,
    questionText:
      'A person is sitting in a travelling train and facing the engine. He tosses up a coin and the coin falls behind him. It can be concluded that the train is:',
    questionImageURL: '',
    options: {
      A: 'Moving forward and gaining speed.',
      B: 'Moving forward and losing speed.',
      C: 'Moving forward with uniform speed.',
      D: 'Moving backward with uniform speed.',
    },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 62,
    questionText:
      'A plumb line is suspended from a ceiling of a car moving with horizontal acceleration of a. What will be the angle of inclination with vertical:',
    questionImageURL: '',
    options: {
      A: 'tan⁻¹(a/g)',
      B: 'tan⁻¹(g/a)',
      C: 'cos⁻¹(a/g)',
      D: 'cos⁻¹(g/a)',
    },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 63,
    questionText:
      "A lift accelerated downward with acceleration 'a'. A man in the lift throws a ball upward with acceleration a₀ (a₀ < a). Then acceleration of ball observed by observer, which is on earth, is:",
    questionImageURL: '',
    options: {
      A: '(a+a₀) upward',
      B: '(a-a₀) upward',
      C: '(a+a₀) downward',
      D: '(a-a₀) downward',
    },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 64,
    questionText:
      'A block can slide on a smooth inclined plane of inclination θ kept on the floor of a lift. When the lift is descending with a retardation a, the acceleration of the block relative to the incline is:',
    questionImageURL: '',
    options: { A: '(g+a) sinθ', B: '(g-a)', C: 'g sinθ', D: '(g-a) sinθ' },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 65,
    questionText:
      'A pulley is attached to the ceiling of a lift moving upwards with some acceleration. Two particles are attached to the two ends of a string passing over the pulley. The masses of the particles are in the ratio 2:1. If the acceleration of the particles is g/2 then the acceleration of the lift will be',
    questionImageURL: '',
    options: { A: 'g', B: 'g/2', C: 'g/3', D: 'g/4' },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 66,
    questionText:
      'The elevator shown in figure is descending, with an acceleration of 2 ms⁻². The mass of the block A is 0.5 kg. The force exerted by the block A on the block B is:',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q66_image.png?alt=media&token=c1935824-c146-4e58-9a3b-240182ec74f5',
    options: { A: '2 N', B: '4 N', C: '6 N', D: '8 N' },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 67,
    questionText:
      "An object of mass 2 kg moving with constant velocity 10 m/s is seen in a frame moving with constant velocity 10 m/s. The value of 'pseudo force' acting on object in this frame will be:",
    questionImageURL: '',
    options: { A: '20 N', B: '0', C: '10 N', D: '2 N' },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 68,
    questionText:
      'An object kept on a smooth inclined plane of inclination θ with horizontal can be kept stationary relative to the incline by giving a horizontal acceleration to the inclined plane, equal to:',
    questionImageURL: '',
    options: { A: 'g sinθ', B: 'g cosθ', C: 'g tanθ', D: 'None of these.' },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 69,
    questionText:
      'Two blocks of masses M₁ and M₂ are connected to each other through a light spring as shown in figure. If we push mass M₁ with force F and cause acceleration a in mass M₁, what will be the magnitude of acceleration in M₂?',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q69_image.png?alt=media&token=25a4d6ef-4613-43a5-b153-f7259074b12c',
    options: { A: 'F/M₂', B: 'F/(M₁+M₂)', C: 'a₁', D: '(F-M₁a₁)/M₂' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 70,
    questionText:
      'A block of mass 4 kg is suspended through two light spring balances A and B. Then A and B will read respectively:',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q70_image.png?alt=media&token=a7c1b52a-3b5a-4b0d-9b16-568850684f85',
    options: {
      A: '4 kg and zero kg',
      B: 'Zero kg and 4 kg',
      C: '4 kg and 4 kg',
      D: '2 kg and 2 kg',
    },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 71,
    questionText:
      'A body of mass 5kg is suspended by a spring balance on an inclined plane as shown in figure. The spring balance measure:',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q71_image.png?alt=media&token=87799532-a5f1-4b15-9279-4d622ca849ca',
    options: { A: '50 N', B: '25 N', C: '500 N', D: '10 N' },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 72,
    questionText:
      'As shown in figure, two equal masses each of 2 kg are suspended from a spring balance. The reading of the spring balance will be:',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q72_image.png?alt=media&token=f6c2d99d-8c5c-4d57-817a-563d76e25713',
    options: {
      A: 'Zero',
      B: '2 kg',
      C: '4 kg',
      D: 'Between zero and 2 kg',
    },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 73,
    questionText:
      'A dynamometer D, is connected with to bodies of mass M = 6 kg and m = 4 kg. If two forces F=20 N & F=10 N are applied on masses according to figure then reading of the dynamometer will be -',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q73_image.png?alt=media&token=5a570020-f5a6-429a-8a71-a83d37a85d38',
    options: { A: '10 N', B: '20 N', C: '6 N', D: '14 N' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 74,
    questionText:
      'A block of mass m is at rest with respect to a rough incline kept in elevator moving up with acceleration a. Which of following statements is correct?',
    questionImageURL: '',
    options: {
      A: 'The contact force between block and incline is of the magnitude m(g+a).',
      B: 'The contact force between block and incline is parallel to the incline.',
      C: 'The contact force between block and incline is perpendicular to the incline.',
      D: 'The contact force is of the magnitude mg cosθ',
    },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 75,
    questionText:
      'Two masses of 10 kg and 20 kg respectively are connected by a massless spring as shown in figure. A force of 200 N acts on the 20 kg mass at the instant when the 10 kg mass has an acceleration of 12 ms⁻² towards right, the acceleration of the 20 kg mass is:',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q75_image.png?alt=media&token=8ff35ca2-2432-4751-acb8-9366115993b4',
    options: { A: '2 ms⁻²', B: '4 ms⁻²', C: '10 ms⁻²', D: '20 ms⁻²' },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 76,
    questionText:
      'A block weighs W is held against a vertical wall by applying a horizontal force F. The minimum value of F needed to hold the block is: (μ < 1)',
    questionImageURL: '',
    options: {
      A: 'Less than W',
      B: 'Equal to W',
      C: 'Greater than W',
      D: 'Data is insufficient',
    },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 77,
    questionText: 'The maximum static frictional force is:',
    questionImageURL: '',
    options: {
      A: 'Equal to twice the area of surface in contact.',
      B: 'Independent of the area of surface in contact.',
      C: 'Equal to the area of surface in contact.',
      D: 'None of the above',
    },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 78,
    questionText:
      'To avoid slipping while walking on ice, one should take smaller steps because of the:',
    questionImageURL: '',
    options: {
      A: 'Friction of ice is large',
      B: 'Larger normal reaction',
      C: 'Friction of ice is small',
      D: 'Smaller normal reaction',
    },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 79,
    questionText:
      'A body of mass 2 kg is kept by pressing to a vertical wall by a force of 100 N. The coefficient of friction between wall and body is 0.3. Then the frictional force is equal to:',
    questionImageURL: '',
    options: { A: '6 N', B: '20 N', C: '600 N', D: '700 N' },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 80,
    questionText:
      'A uniform metal chain is placed on a rough table such that one end of chain hangs down over the edge of the table. When one-third of its length hangs over the edge, the chain starts sliding. Then, the coefficient of static friction is:',
    questionImageURL: '',
    options: { A: '3/4', B: '1/4', C: '2/3', D: '1/2' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 81,
    questionText: 'The static frictional force is -',
    questionImageURL: '',
    options: {
      A: 'Self adjustable',
      B: 'Not self adjustable',
      C: 'scalar quantity',
      D: 'Equal to the limiting force',
    },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 82,
    questionText:
      'A block is placed on a rough floor and a horizontal force F is applied on it. The force of friction f by the floor on the block is measured for different values of F and a graph is plotted between them. Mark the correct statements.',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q82_image.png?alt=media&token=e1f81d11-53b6-455b-9b48-12502f6a738c',
    options: {
      A: 'The graph is a straight line of slope 45° for small F and a straight line parallel to the F-axis for large F; There is small kink on the graph',
      B: 'The graph is a straight line of slope 45°; There is small kink on the graph',
      C: 'The graph is a straight line of slope 45°; The graph is straight line parallel to the F axis',
      D: 'The graph is a straight line of slope 45°; The graph is a straight line of slope 45° for small F and a straight line parallel to the F-axis for large F.',
    },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 83,
    questionText: 'It is easier to pull a body than to push, because-',
    questionImageURL: '',
    options: {
      A: 'the coefficient of friction is more in pushing than that in pulling',
      B: 'the friction force is more in pushing than that in pulling',
      C: 'the body does not move forward when pushed.',
      D: 'none of these',
    },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 84,
    questionText:
      'Mark the correct statements about the friction between two bodies',
    questionImageURL: '',
    options: {
      A: 'coefficient of static friction is always greater than the coefficient of kinetic friction; limiting friction is always greater than the kinetic friction; limiting friction is never less than static friction',
      B: 'static friction is always greater than the kinetic friction; coefficient of static friction is always greater than the coefficient of kinetic friction; limiting friction is always greater than the kinetic friction',
      C: 'static friction is always greater than the kinetic friction; limiting friction is always greater than the kinetic friction; limiting friction is never less than static friction',
      D: 'static friction is always greater than the kinetic friction; coefficient of static friction is always greater than the coefficient of kinetic friction; limiting friction is never less than static friction',
    },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 85,
    questionText:
      'The coefficient of static friction between two surfaces depends on -',
    questionImageURL: '',
    options: {
      A: 'Nature of surfaces',
      B: 'The shape of the surfaces in contact',
      C: 'The area of contact',
      D: 'All of the above',
    },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 86,
    questionText:
      'A 20 kg block is initially at rest. A 75 N force is required to set the block in motion. After the motion, a force of 60 N is applied to keep the block moving with constant speed. The coefficient of static friction is-',
    questionImageURL: '',
    options: { A: '0.6', B: '0.52', C: '0.44', D: '0.35' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 87,
    questionText:
      'A circular road of radius R is banked for a speed v = 40 km/hr. A car of mass m attempts to go on the circular road, the friction co-efficient between the tyre and road is negligible.',
    questionImageURL: '',
    options: {
      A: 'If the car runs at the correct speed of 40 km/hr, the force by the road on the car is greater than mg as well as greater than mv²/r',
      B: 'If the car runs at a speed greater than 40 km/hr, it will slip up the slope',
      C: 'If the car runs at the correct speed of 40 km/hr, the force by the road on the car is equal to mv²/r',
      D: 'The car cannot make a turn without skidding',
    },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 88,
    questionText:
      'A 60 kg body is pushed horizontally with just enough force to start it moving across a floor and the same force continues to act afterwards. The coefficient of static friction and sliding friction are 0.5 and 0.4 respectively. The acceleration of the body is (g=10m/s²):',
    questionImageURL: '',
    options: { A: '6 m/s²', B: '4.9 m/s²', C: '3.92 m/s²', D: '1 m/s²' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 89,
    questionText:
      'A block of mass 5 kg is on a rough horizontal surface and is at rest. Now a force of 24 N is imparted to it with negligible impulse. If the coefficient of kinetic friction is 0.4 and g = 9.8 m/s², then the acceleration of the block is:',
    questionImageURL: '',
    options: { A: '0.26 m/s²', B: '0.39 m/s²', C: '0.69 m/s²', D: '0.88 m/s²' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 90,
    questionText:
      'Two carts of masses 200 kg and 300 kg on horizontal rails imparted with same speed in opposite direction. Suppose the coefficient of friction between the carts and the rails are same. If the 200 kg cart travels a distance of 36 m and stops, then the distance travelled by the cart weighing 300 kg is:',
    questionImageURL: '',
    options: { A: '32 m', B: '24 m', C: '36 m', D: '12 m' },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 91,
    questionText: 'If the normal force is doubled, the co-efficient of friction is:',
    questionImageURL: '',
    options: { A: 'halved', B: 'doubled', C: 'tripled', D: 'not changed' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 92,
    questionText:
      'A car is moving along a straight horizontal road with a speed v₀. If the coefficient of friction between the tyres and the road is μ then the shortest distance in which the car can be stopped is-',
    questionImageURL: '',
    options: { A: 'v₀²/2μg', B: 'v₀/2μg', C: 'v₀²/μg', D: 'v₀/μ' },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 93,
    questionText:
      'Adjoining figure shows two blocks A and B pushed against the wall with the force F. The wall is smooth but the surfaces in contact of A and B are rough. Which of the following is true for the system of blocks to be at rest against the wall',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q93_image.png?alt=media&token=c1901a1d-b8cb-4654-9721-3957262ac0a1',
    options: {
      A: 'F should be more than the weight of A and B.',
      B: 'F should be equal to the weight of A and B.',
      C: 'F should be less than the weight of A and B.',
      D: 'system cannot be in equilibrium.',
    },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 94,
    questionText:
      'In the figure shown, a block of weight 10 N resting on a horizontal surface. The coefficient of static friction between the block and the surface μs = 0.4. A force of 3.5 N will keep the block in uniform motion, once it has been set in motion. A horizontal force of 3 N is applied to the block, then the block will:',
    questionImageURL: '',
    options: {
      A: 'Move over the surface with constant velocity.',
      B: 'Move having accelerated motion over the surface.',
      C: 'No move',
      D: 'First it will move with a constant velocity for some time and then will have accelerated motion.',
    },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 95,
    questionText:
      "A rough vertical board has an acceleration 'a' so that a 2 kg block pressing against it does not fall. The coefficient of friction between the block and the board should be:",
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q95_image.png?alt=media&token=df4f4948-c89b-449b-8ca0-323a63df440d',
    options: { A: '≥ g/a', B: '< g/a', C: '= g/a', D: '> a/g' },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 96,
    questionText:
      'A body A of mass M is kept on a rough horizontal surface (friction coefficient = μ). A person is trying to pull the body by applying a horizontal force but the body is not moving. The force by the surface on A is F where-',
    questionImageURL: '',
    options: {
      A: 'F = Mg',
      B: 'F = μMg',
      C: 'Mg ≤ F ≤ Mg√(1+μ²)',
      D: 'Mg ≥ F ≥ Mg√(1-μ²)',
    },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 97,
    questionText:
      'In a situation the contact force by a rough horizontal surface on a body placed on it, has constant magnitude if the angle between this force and the vertical is decreased, the frictional force between the surface and the body will-',
    questionImageURL: '',
    options: {
      A: 'increase',
      B: 'decrease',
      C: 'remain the same',
      D: 'may increase or decrease',
    },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 98,
    questionText:
      'A block of mass 2kg is placed on the floor. The coefficient of static friction is 0.4. Force of 2.8N is applied horizontally on the block. The force of friction between the block and the floor is',
    questionImageURL: '',
    options: { A: '2.8 N', B: '8 N', C: '2.0 N', D: 'zero' },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 99,
    questionText:
      'The frictional force of the air on the body of mass 0.25 kg, falling with an acceleration of 9.2 m/s², will be:',
    questionImageURL: '',
    options: { A: '1.0 N', B: '0.55 N', C: '0.25 N', D: '0.15 N' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 100,
    questionText:
      'A block A kept on an inclined surface just begins to slide if the inclination is 30°. The block is replaced by another block B and it is found that it just begins to slide if the inclination is 40° -',
    questionImageURL: '',
    options: {
      A: 'mass of A > mass of B',
      B: 'mass of A < mass of B',
      C: 'mass of A = mass of B',
      D: 'all the three are possible',
    },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 101,
    questionText:
      'A block of metal is lying on the floor of a bus. The maximum acceleration which can be given to the bus so that the block may remain at rest, will be-',
    questionImageURL: '',
    options: { A: 'μg', B: 'μ/g', C: 'μ²g', D: 'μg²' },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 102,
    questionText:
      "A box 'A' is lying on the horizontal floor of the compartment of a train running along horizontal rails from left to right. At time 't', it decelerates. Then the reaction R by the floor on the box is given best by:",
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q102_image.png?alt=media&token=d324838b-d779-4a94-817a-8f74e6490c68',
    options: {
      A: 'Diagram A',
      B: 'Diagram B',
      C: 'Diagram C',
      D: 'Diagram D',
    },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 103,
    questionText:
      'A block of mass 2 kg rests on a rough inclined plane making an angle of 30° with the horizontal. The coefficient of static friction between the block and the plane is 0.7. The frictional force on the block is (g=9.8m/s²):',
    questionImageURL: '',
    options: {
      A: '9.8 N',
      B: '0.7 x 9.8 N',
      C: '9.8 x 7 N',
      D: '0.8 x 9.8 N',
    },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 104,
    questionText:
      'A block of mass 5 kg and surface area 2 m² just begins to slide down on an inclined plane when the angle of inclination is 30°. Keeping mass same, the surface area of the block is doubled. The angle at which it starts sliding down is:',
    questionImageURL: '',
    options: { A: '30°', B: '60°', C: '15°', D: 'none' },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 105,
    questionText:
      'The blocks A and B are arranged as shown in the figure. The pulley is frictionless. The mass of A is 10 kg. The coefficient of friction between block A and horizontal surface is 0.20. The minimum mass of B to start the motion will be-',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q105_image.png?alt=media&token=362d2948-7389-40ed-a162-8179471d2b86',
    options: { A: '2 kg', B: '0.2 kg', C: '5 kg', D: '10 kg' },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 106,
    questionText:
      'When a body is placed on a rough plane inclined at an angle θ to the horizontal, its acceleration is:',
    questionImageURL: '',
    options: {
      A: 'g(sinθ-cosθ)',
      B: 'g(sinθ-μ cosθ)',
      C: 'g(μ sinθ-cosθ)',
      D: 'gμ(sinθ-cosθ)',
    },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 107,
    questionText:
      'A lift is moving downwards with an acceleration equal to acceleration due to gravity. A body of mass M kept on the floor of the lift is pulled horizontally. If the coefficient of friction is μ, then the frictional resistance offered by the body is:',
    questionImageURL: '',
    options: { A: 'Mg', B: 'μMg', C: '2μMg', D: 'Zero' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 108,
    questionText:
      'In the above question, if the lift is moving upwards with a uniform velocity, then the frictional resistance offered by the body is:',
    questionImageURL: '',
    options: { A: 'Mg', B: 'μMg', C: '2μMg', D: 'Zero' },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 109,
    questionText:
      'If the coefficient of friction of a plane inclined at 45° is 0.5, then acceleration of a body sliding freely on it is (g=9.8m/s²)-',
    questionImageURL: '',
    options: {
      A: '4.9 m/s²',
      B: '9.8 m/s²',
      C: '9.8/√2 m/s²',
      D: '9.8/2√2 m/s²',
    },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 110,
    questionText:
      'A body of mass 100 g is sliding from an inclined plane of inclination 30°. What is the frictional force experienced if μ=1.7',
    questionImageURL: '',
    options: {
      A: '1.7x√2x(1/√3) N',
      B: '1.7x√3x(1/2) N',
      C: '1.7x√3 N',
      D: '1.7x√2x(1/3) N',
    },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 111,
    questionText:
      'The force required to just move a body up the inclined plane is double the force required to just prevent the body from sliding down the plane. The coefficient of friction is μ. The inclination θ of the plane is:',
    questionImageURL: '',
    options: { A: 'tan⁻¹(μ)', B: 'tan⁻¹(μ/2)', C: 'tan⁻¹(2μ)', D: 'tan⁻¹(3μ)' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 112,
    questionText:
      'A body is sliding down an inclined plane having coefficient of friction 0.5. If the normal reaction is twice that of the resultant downward force along the incline, the angle between the inclined plane and the horizontal is:',
    questionImageURL: '',
    options: { A: '15°', B: '30°', C: '45°', D: '60°' },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 113,
    questionText:
      'A block of mass m=2 kg is resting on a rough inclined plane of inclination 30° as shown in figure. The coefficient of friction between the block and the plane is μ=0.5. What minimum force F should be applied perpendicular to the plane on the block, so that block does not slip on the plane (g=10m/s²)',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q113_image.png?alt=media&token=c1901a1d-b8cb-4654-9721-3957262ac0a1',
    options: { A: 'zero', B: '6.24 N', C: '2.68 N', D: '4.34 N' },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 114,
    questionText:
      'A block of mass 15 kg is placed on a long trolley. The coefficient of friction between the block and trolley is 0.18. The trolley accelerates from rest with 0.5 m/s² for 20 s. then what is the friction force:',
    questionImageURL: '',
    options: { A: '3.5 N', B: '133.3 N', C: '7.5 N', D: 'N.O.T.' },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 115,
    questionText:
      'A 2 kg block (A) is placed on 8 kg block (B) which rest on the table. Coefficient of the friction between (A) and (B) is 0.2 and between (B) and table is 0.5. A 25 N horizontal force is applied on the block (B), than the friction force between the block (A) and (B) is:',
    questionImageURL: '',
    options: { A: 'Zero', B: '3.9 N', C: '5 N', D: '49 N' },
    correctAnswer: 'A',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 116,
    questionText:
      'A block is dragged on smooth plane with the help of a rope which moves with velocity v. The horizontal velocity of the block is:',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q116_image.png?alt=media&token=c1901a1d-b8cb-4654-9721-3957262ac0a1',
    options: { A: 'v', B: 'v/sinθ', C: 'v sinθ', D: 'v/cosθ' },
    correctAnswer: 'B',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 117,
    questionText:
      'In the figure shown, blocks A and B move with velocities v₁ and v₂ along horizontal direction. The ratio of v₁/v₂ is',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q117_image.png?alt=media&token=c1901a1d-b8cb-4654-9721-3957262ac0a1',
    options: {
      A: 'sinθ₂/sinθ₁',
      B: 'sinθ₁/sinθ₂',
      C: 'cosθ₂/cosθ₁',
      D: 'cosθ₁/cosθ₂',
    },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 118,
    questionText:
      'In the figure shown, the pulley is moving with velocity u. The velocity of the block attached with string:',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q118_image.png?alt=media&token=c1901a1d-b8cb-4654-9721-3957262ac0a1',
    options: { A: '4u', B: '3u', C: 'u', D: '2u' },
    correctAnswer: 'D',
    chapter: 'NLM',
    subject: 'Physics',
  },
  {
    questionNumber: 119,
    questionText:
      'Two masses are connected by a string which passes over a pulley accelerating upward at a rate A as shown. If a₁ and a₂ be the acceleration of bodies 1 and 2 respectively then:',
    questionImageURL:
      'https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/q119_image.png?alt=media&token=c1901a1d-b8cb-4654-9721-3957262ac0a1',
    options: {
      A: 'A = a₁-a₂',
      B: 'A = a₁+a₂',
      C: 'A = (a₁-a₂)/2',
      D: 'A = (a₁+a₂)/2',
    },
    correctAnswer: 'C',
    chapter: 'NLM',
    subject: 'Physics',
  },
];

export const nlmRankersQuestions: Question[] = [
    {
        "questionNumber": 1,
        "questionText": "A particle of mass m, initially at rest, is acted upon by a variable force F for a brief interval of time T. It begins to move with a velocity u after the force stops acting. F is shown in the graph as a function of time. The curve is a semicircle.",
        "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/neet_ranker_q1.png?alt=media",
        "options": {
            "A": "u = (π * F₀²)/m",
            "B": "u = (π * T²)/(8*m)",
            "C": "u = (π * F₀ * T)/(4*m)",
            "D": "u = (F₀ * T)/(2*m)"
        },
        "correctAnswer": "C"
    },
    {
        "questionNumber": 2,
        "questionText": "Calculate the acceleration of the mass 12 kg shown in the set up of fig. Also calculate the tension in the string connecting the 12 kg mass. The string are weightless and inextensible, the pulleys are weightless and frictionless-",
        "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/neet_ranker_q2.png?alt=media",
        "options": {
            "A": "(g/10), (56g/5) N",
            "B": "(2g/7), (60g/7) N",
            "C": "(10/g), (5/56g) N",
            "D": "(g/14), (5/56g) N"
        },
        "correctAnswer": "B"
    },
    {
        "questionNumber": 3,
        "questionText": "A body kept on a smooth inclined plane of inclination 1 in x will remain stationary relative to the inclined plane if the plane is given a horizontal acceleration equal to :-",
        "questionImageURL": "",
        "options": {
            "A": "√(x²-1)g",
            "B": "(√(x²-1)/x)g",
            "C": "(gx)/√(x²-1)",
            "D": "g/√(x²-1)"
        },
        "correctAnswer": "D"
    },
    {
        "questionNumber": 4,
        "questionText": "A ball of mass m moves with speed v and it strikes normally with a wall and reflected back normally, if its time of contact with wall is t then find force exerted by ball on wall",
        "questionImageURL": "",
        "options": {
            "A": "mv",
            "B": "(2mv)/t",
            "C": "mv/t",
            "D": "mv/(2t)"
        },
        "correctAnswer": "B"
    },
    {
        "questionNumber": 5,
        "questionText": "What is the velocity of block A (VA) in the figure as shown above.",
        "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/neet_ranker_q5.png?alt=media",
        "options": {
            "A": "10",
            "B": "5",
            "C": "6",
            "D": "None"
        },
        "correctAnswer": "A"
    },
    {
        "questionNumber": 6,
        "questionText": "A satellite in force free space sweeps stationary interplanetary dust at a rate (dM/dt) = +αv. The acceleration of satellite of mass M is :-",
        "questionImageURL": "",
        "options": {
            "A": "-4αv²/M",
            "B": "-2αv²/M",
            "C": "-αv²/M",
            "D": "-αv²"
        },
        "correctAnswer": "C"
    },
    {
        "questionNumber": 7,
        "questionText": "For a Rocket propulsion velocity of exhaust gasses relative to rocket is 2 km/s. If mass of rocket system is 1000 kg, then the rate of fuel consumption for a rocket to rise up with acceleration 4.9 m/s² will be",
        "questionImageURL": "",
        "options": {
            "A": "12.25 kg/s",
            "B": "17.5 kg/s",
            "C": "7.35 kg/s",
            "D": "5.2 kg/s"
        },
        "correctAnswer": "C"
    },
    {
        "questionNumber": 8,
        "questionText": "A trolley of mass 5 kg on a horizontal smooth surface is pulled by a load of mass 2 kg by means of uniform rope ABC of length 2 m and mass 1 kg. As the load falls from BC = 0 to BC = 2m its acceleration in m/s² changes-",
        "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/neet_ranker_q8.png?alt=media",
        "options": {
            "A": "20/6 to 30/8",
            "B": "20/8 to 30/8",
            "C": "20/5 to 30/6",
            "D": "None of the above"
        },
        "correctAnswer": "B"
    },
    {
        "questionNumber": 9,
        "questionText": "Two fixed frictionless inclined planes making an angle 30° and 60° with the vertical are shown in the figure. Two blocks A and B are placed on the two planes. What is the relative vertical acceleration of A with respect to B?",
        "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/neet_ranker_q9.png?alt=media",
        "options": {
            "A": "4.9 ms⁻² in vertical direction.",
            "B": "4.9 ms⁻² in horizontal direction",
            "C": "9.8 ms⁻² in vertical direction",
            "D": "Zero"
        },
        "correctAnswer": "A"
    },
    {
        "questionNumber": 10,
        "questionText": "A particle of mass m is at rest at the origin at time t=0. It is subjected to a force F(t) = F₀e⁻ᵇᵗ in the x-direction. Its speed v(t) is depicted by which of the following curves?",
        "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/neet_ranker_q10.png?alt=media",
        "options": {
            "A": "Curve 1",
            "B": "Curve 2",
            "C": "Curve 3",
            "D": "Curve 4"
        },
        "correctAnswer": "D"
    },
    {
        "questionNumber": 11,
        "questionText": "A block is kept on a smooth inclined plane of angle of inclination 30° that moves with a constant acceleration so that the block does not slide relative to the inclined plane. Let F₁ be the contact force between the block and the plane. Now the inclined plane stops and let F₂ be the contact force between the two in this case. Then F₁/F₂ is",
        "questionImageURL": "",
        "options": {
            "A": "1",
            "B": "4/3",
            "C": "2",
            "D": "3/2"
        },
        "correctAnswer": "C"
    },
    {
        "questionNumber": 12,
        "questionText": "Two blocks A and B of masses m & 2m respectively are held at rest such that the spring is in natural length. What is the acceleration of both the blocks just after release?",
        "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/neet_ranker_q12.png?alt=media",
        "options": {
            "A": "g↓, g↓",
            "B": "g/3↓, g/3↑",
            "C": "0, 0",
            "D": "g↓, 0"
        },
        "correctAnswer": "A"
    },
    {
        "questionNumber": 13,
        "questionText": "A string of negligible mass going over a clamped pulley of mass m supports a block of mass M as shown in the figure. The force on the pulley by the clamp is given by :-",
        "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/neet_ranker_q13.png?alt=media",
        "options": {
            "A": "√2 * Mg",
            "B": "√2 * mg",
            "C": "√((M+m)² + m²) * g",
            "D": "√((M+m)² + M²) * g"
        },
        "correctAnswer": "D"
    },
    {
        "questionNumber": 14,
        "questionText": "A block is placed on an inclined plane moving towards right horizontally with an acceleration a₀ = g. The length of the plane AC = 1m. Friction is absent everywhere. The time taken by the block to reach from C to A is (g=10 m/s²)",
        "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/neet_ranker_q14.png?alt=media",
        "options": {
            "A": "1.2 s",
            "B": "0.74 s",
            "C": "2.56 s",
            "D": "0.42 s"
        },
        "correctAnswer": "B"
    },
    {
        "questionNumber": 15,
        "questionText": "A light string fixed at one end to a clamp on ground passes over a fixed pulley and hangs at the other side. It makes an angle of 30° with the ground. A monkey of mass 5 kg climbs up the rope. The clamp can tolerate a vertical force of 40 N only. The maximum acceleration in upward direction with which the monkey can climb safely is (neglect friction and take g=10 m/s²):",
        "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/neet_ranker_q15.png?alt=media",
        "options": {
            "A": "2 m/s²",
            "B": "4 m/s²",
            "C": "6 m/s²",
            "D": "8 m/s²"
        },
        "correctAnswer": "C"
    },
    {
        "questionNumber": 16,
        "questionText": "Two block (A) 2 kg and (B) 5 kg rest one over the other on a smooth horizontal plane. The coefficient of static and dynamic friction between (A) and (B) is the same and equal to 0.60. The maximum horizontal force that can be applied to (B) in order that both (A) and (B) do not have any relative motion:",
        "questionImageURL": "",
        "options": {
            "A": "42 N",
            "B": "42 kgf",
            "C": "5.4 kgf",
            "D": "1.2 N"
        },
        "correctAnswer": "A"
    },
    {
        "questionNumber": 17,
        "questionText": "A block of mass m lying on a rough horizontal plane is acted upon by a horizontal force P and another force Q inclined at an angle θ to the vertical. The block will remain in equilibrium if the coefficient of friction between it and the surface is :-",
        "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/neet_ranker_q17.png?alt=media",
        "options": {
            "A": "(P + Qsinθ)/(mg + Qcosθ)",
            "B": "(Pcosθ + Q)/(mg - Qsinθ)",
            "C": "(P + Qcosθ)/(mg + Qsinθ)",
            "D": "(Psinθ + Q)/(mg - Qcosθ)"
        },
        "correctAnswer": "A"
    },
    {
        "questionNumber": 18,
        "questionText": "A 40 kg slab rests on a frictionless floor as shown in the figure. A 10 kg block rests on the top of the slab. The static coefficient of friction between the block and slab is 0.60 while the kinetic friction is 0.40. The 10 kg block is acted upon by a horizontal force 100 N. If g = 9.8 m/s², the resulting acceleration of the slab will be:",
        "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/neet_ranker_q18.png?alt=media",
        "options": {
            "A": "0.98 m/s²",
            "B": "1.47 m/s²",
            "C": "1.52 m/s²",
            "D": "6.1 m/s²"
        },
        "correctAnswer": "A"
    },
    {
        "questionNumber": 19,
        "questionText": "Two block A and B placed on a plane surface as shown in the figure. The mass of block A is 100 kg and that of block B is 200 kg. Block A is tied to a stand and block B is pulled by a force F. If the coefficient of friction between the surfaces of A and B is 0.2 and the coefficient of friction between B and the plane is 0.3 then for the motion of B the minimum value of F will be-",
        "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/neet_ranker_q19.png?alt=media",
        "options": {
            "A": "700 N",
            "B": "1050 N",
            "C": "900 N",
            "D": "1100 N"
        },
        "correctAnswer": "D"
    },
    {
        "questionNumber": 20,
        "questionText": "In the arrangement shown in figure, coefficient of friction between the two blocks is μ = 1/2. The force of friction acting between the two blocks is",
        "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/neet_ranker_q20.png?alt=media",
        "options": {
            "A": "8 N",
            "B": "10 N",
            "C": "6 N",
            "D": "4 N"
        },
        "correctAnswer": "A"
    },
    {
        "questionNumber": 21,
        "questionText": "A block A of mass m is placed over a plank B of mass 2m. Plank B is placed over a smooth horizontal surface. The coefficient of friction between A and B is 0.5. Block A is given a velocity v₀ towards right. Acceleration of B relative to A is",
        "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/neet_ranker_q21.png?alt=media",
        "options": {
            "A": "g/2",
            "B": "g",
            "C": "3g/4",
            "D": "zero"
        },
        "correctAnswer": "C"
    },
    {
        "questionNumber": 22,
        "questionText": "In the figure shown if friction coefficient of block 1kg and 2kg with inclined plane is μ₁ = 0.5 and μ₂ = 0.4 respectively, then",
        "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/neet_ranker_q22.png?alt=media",
        "options": {
            "A": "both block will move together",
            "B": "both block will move separately",
            "C": "there is a non zero contact force between two blocks",
            "D": "None of these"
        },
        "correctAnswer": "B"
    },
    {
        "questionNumber": 23,
        "questionText": "A smooth block is released at rest on a 45° incline and then slides a distance d. The time taken to slide is n times as much to slide on rough incline than on a smooth incline. The coefficient of friction is-",
        "questionImageURL": "",
        "options": {
            "A": "μₖ = 1 - 1/n²",
            "B": "μₖ = √(1 - 1/n²)",
            "C": "μₛ = 1 - 1/n²",
            "D": "μₛ = √(1 - 1/n²)"
        },
        "correctAnswer": "A"
    },
    {
        "questionNumber": 24,
        "questionText": "A uniform rope of length L and mass M is placed on a smooth fixed wedge as shown. Both ends of rope are at same horizontal level. The rope is initially released from rest, then the magnitude of initial acceleration of rope is",
        "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/neet_ranker_q24.png?alt=media",
        "options": {
            "A": "Zero",
            "B": "M(cosα - cosβ)g",
            "C": "M(tanα - tanβ)g",
            "D": "None of these"
        },
        "correctAnswer": "A"
    },
    {
        "questionNumber": 25,
        "questionText": "If the net force acting on a system is represented by F and its momentum is p, then match the entries of column-I with the entries of column-II",
        "questionImageURL": "",
        "options": {
            "A": "(a)->(p,q,r), (b)->(p,q.r), (c)->(q), (d)->(s)",
            "B": "(a)->(p,q,r), (b)->(q,r), (c)->(q), (d)->(s)",
            "C": "(a)->(p,q,s), (b)->(p,q.p), (c)->(q), (d)->(s)",
            "D": "(a)->(p,q,r), (b)->(p,q.s), (c)->(p), (d)->(s)"
        },
        "correctAnswer": "A"
    },
    {
        "questionNumber": 26,
        "questionText": "Angle θ is gradually increased as shown in figure. For the given situation match the following two columns. (g=10 ms⁻²)",
        "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/neet_ranker_q26.png?alt=media",
        "options": {
            "A": "(a)->(r), (b)->(r), (c)->(s), (d)->(q)",
            "B": "(a)->(s), (b)->(s), (c)->(p), (d)->(p)",
            "C": "(a)->(s), (b)->(s), (c)->(q), (d)->(q)",
            "D": "(a)->(p), (b)->(p), (c)->(r), (d)->(s)"
        },
        "correctAnswer": "B"
    },
    {
        "questionNumber": 27,
        "questionText": "Match the following two columns regarding fundamental forces of nature.",
        "questionImageURL": "",
        "options": {
            "A": "(a)->(p,r), (b)->(q,r), (c)->(s), (d)->(p,s)",
            "B": "(a)->(s,r), (b)->(p,r), (c)->(s), (d)->(p,q)",
            "C": "(a)->(q,r), (b)->(q,r), (c)->(s), (d)->(p,s)",
            "D": "(a)->(p,r), (b)->(q,r), (c)->(s,r), (d)->(p,s)"
        },
        "correctAnswer": "C"
    },
    {
        "questionNumber": 28,
        "questionText": "Assertion: Two frames S₁ and S₂ are non-inertial. Then frame S₂ when observed from S₁ is inertial. Reason: A frame in motion is not necessarily a non-inertial frame.",
        "questionImageURL": "",
        "options": {
            "A": "Both Assertion and Reason are true and the Reason is correct explanation of the Assertion.",
            "B": "Both Assertion and Reason are true but Reason is not the correct explanation of Assertion.",
            "C": "Assertion is true, but the Reason is false.",
            "D": "If Assertion is false but the Reason is true."
        },
        "correctAnswer": "D"
    },
    {
        "questionNumber": 29,
        "questionText": "Assertion: If net force on a rigid body in zero, it is either at rest or moving with a constant linear velocity. Nothing else can happen. Reason: Constant velocity means linear acceleration is zero.",
        "questionImageURL": "",
        "options": {
            "A": "Both Assertion and Reason are true and the Reason is correct explanation of the Assertion.",
            "B": "Both Assertion and Reason are true but Reason is not the correct explanation of Assertion.",
            "C": "Assertion is true, but the Reason is false.",
            "D": "If Assertion is false but the Reason is true."
        },
        "correctAnswer": "D"
    },
    {
        "questionNumber": 30,
        "questionText": "Assertion: Moment of concurrent forces about any point is constant. Reason: If vector sum of all the concurrent forces is zero, then moment of all the forces about any point is also zero.",
        "questionImageURL": "",
        "options": {
            "A": "Both Assertion and Reason are true and the Reason is correct explanation of the Assertion.",
            "B": "Both Assertion and Reason are true but Reason is not the correct explanation of Assertion.",
            "C": "Assertion is true, but the Reason is false.",
            "D": "If Assertion is false but the Reason is true."
        },
        "correctAnswer": "D"
    },
    {
        "questionNumber": 31,
        "questionText": "Assertion: Three concurrent forces are F₁, F₂ and F₃. Angle between F₁ and F₂ is 30°, between F₁ and F₃ is 120°. Under these conditions, forces cannot remain in equilibrium. Reason: At least one angle should be greater than 180°.",
        "questionImageURL": "",
        "options": {
            "A": "Both Assertion and Reason are true and the Reason is correct explanation of the Assertion.",
            "B": "Both Assertion and Reason are true but Reason is not the correct explanation of Assertion.",
            "C": "Assertion is true, but the Reason is false.",
            "D": "If Assertion is false but the Reason is true."
        },
        "correctAnswer": "A"
    },
    {
        "questionNumber": 32,
        "questionText": "Assertion: Minimum force is needed to move a block on rough surface, if θ = angle of friction. Reason: Angle of friction and angle of repose are numerically same.",
        "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/neet_ranker_q32.png?alt=media",
        "options": {
            "A": "Both Assertion and Reason are true and the Reason is correct explanation of the Assertion.",
            "B": "Both Assertion and Reason are true but Reason is not the correct explanation of Assertion.",
            "C": "Assertion is true, but the Reason is false.",
            "D": "If Assertion is false but the Reason is true."
        },
        "correctAnswer": "B"
    },
    {
        "questionNumber": 33,
        "questionText": "Assertion: When a person walks on a rough surface, the frictional force exerted by surface on the person is opposite to the direction of his motion. Reason: It is the force exerted by the road on the person that causes the motion.",
        "questionImageURL": "",
        "options": {
            "A": "Both Assertion and Reason are true and the Reason is correct explanation of the Assertion.",
            "B": "Both Assertion and Reason are true but Reason is not the correct explanation of Assertion.",
            "C": "Assertion is true, but the Reason is false.",
            "D": "If Assertion is false but the Reason is true."
        },
        "correctAnswer": "D"
    }
];

export const electrostaticsQuestions: Question[] = [
  {"questionNumber": 1, "questionText": "One quantum of charge should be at least be equal to the charge in coloumb:", "questionImageURL": "", "options": {"A": "1.6 x 10⁻¹⁷ C", "B": "1.6 x 10⁻¹⁹ C", "C": "1.6 x 10⁻¹⁰ C", "D": "4.8 x 10⁻¹⁰ C"}, "correctAnswer": "B"},
  {"questionNumber": 2, "questionText": "If a body is charged by rubbing it, its weight -", "questionImageURL": "", "options": {"A": "always decreases slightly", "B": "always increases slightly", "C": "may increase slightly or may decrease slightly", "D": "remains precisely the same"}, "correctAnswer": "C"},
  {"questionNumber": 3, "questionText": "An accelerated or deaccelerated charge produces-", "questionImageURL": "", "options": {"A": "Electric field only", "B": "Magnetic field only", "C": "Localised electric and magnetic fields", "D": "Electric and magnetic fields that are radiated"}, "correctAnswer": "D"},
  {"questionNumber": 4, "questionText": "A stationary electric charge produces-", "questionImageURL": "", "options": {"A": "Only electric fields", "B": "Only magnetic field", "C": "Both electric as magnetic field", "D": "Neither electric Nor magnetic field"}, "correctAnswer": "A"},
  {"questionNumber": 5, "questionText": "When a piece of polythene is rubbed with wool, a charge of -2 x 10⁻⁷ C is developed on polythene. What is the amount of mass, which is transferred to polythene.", "questionImageURL": "", "options": {"A": "11.38 x 10⁻²⁹ kg", "B": "11.38 x 10²⁹ kg", "C": "11.38 x 10⁻¹⁹ kg", "D": "11.38 x 10⁻³⁹ kg"}, "correctAnswer": "C"},
  {"questionNumber": 6, "questionText": "Two identical metallic sphere are given equal amount of positive and negative charges so that their mass become m₁ and m₂ respectively. Compare their masses.", "questionImageURL": "", "options": {"A": "m₁ > m₂", "B": "m₁ < m₂", "C": "m₁ = m₂", "D": "None of these"}, "correctAnswer": "B"},
  {"questionNumber": 7, "questionText": "Which of the following charge can not present on oil drop in Millikan's experiment :-", "questionImageURL": "", "options": {"A": "4.0 x 10⁻¹⁹ C", "B": "6.0 x 10⁻¹⁹ C", "C": "10.0 x 10⁻¹⁹ C", "D": "all of them"}, "correctAnswer": "D"},
  {"questionNumber": 8, "questionText": "In 1 g of a solid, there are 5 x 10²¹ atoms. If one electron is removed from everyone of 0.01% atoms of the solid, the charge gained by the solid is: (electronic charge is 1.6 x 10⁻¹⁹ C)", "questionImageURL": "", "options": {"A": "+0.08 C", "B": "+0.8 C", "C": "-0.08 C", "D": "-0.8 C"}, "correctAnswer": "A"},
  {"questionNumber": 9, "questionText": "If in Millikan's oil drop experiment charges on drops are found to be 8µC, 12µC, 20µC, then quanta of charge is:", "questionImageURL": "", "options": {"A": "8µC", "B": "4µC", "C": "20µC", "D": "12µC"}, "correctAnswer": "B"},
  {"questionNumber": 10, "questionText": "What equal charges would to be placed on earth and moon to neutralize their gravitational attraction (Use mass of earth = 10²⁵ kg, mass of moon = 10²³ kg)", "questionImageURL": "", "options": {"A": "8.6 x 10¹³ C", "B": "6.8 x 10²⁶ C", "C": "8.6 x 10³ C", "D": "9 x 10⁶ C"}, "correctAnswer": "A"},
  {"questionNumber": 11, "questionText": "When the distance between two charged particle is halved, the force between them becomes -", "questionImageURL": "", "options": {"A": "One fourth", "B": "One half", "C": "Double", "D": "Four times"}, "correctAnswer": "D"},
  {"questionNumber": 12, "questionText": "1 esu charge is placed in vacuum at 1 cm from an equal charge of the same kind. Force between them is", "questionImageURL": "", "options": {"A": "1 Newton", "B": "1 dyne", "C": "2 dyne", "D": "4 dyne"}, "correctAnswer": "B"},
  {"questionNumber": 13, "questionText": "Coulomb's law for the force between electric charges most closely resembles with:", "questionImageURL": "", "options": {"A": "Law of conservation of energy", "B": "Newton's law of gravitation", "C": "Newton's 2nd law of motion", "D": "The law of conservation of charge"}, "correctAnswer": "B"},
  {"questionNumber": 14, "questionText": "A point charge q₁ exerts a force F upon another point charge q₂. If a third charge q₃ be placed quite near the charge q₂ then the force that charge q₁ exerts on the charge q₂ will be :", "questionImageURL": "", "options": {"A": "F", "B": ">F", "C": "<F", "D": "zero"}, "correctAnswer": "A"},
  {"questionNumber": 15, "questionText": "A charge Q is divided in two parts Q₁ and Q₂ and these charges are placed at a distance R. There will be maximum repulsion between them when", "questionImageURL": "", "options": {"A": "Q₂ = Q/R, Q₁ = Q - Q₂", "B": "Q₂ = Q/3, Q₁ = 2Q/3", "C": "Q₂ = Q/4, Q₁ = 3Q/4", "D": "Q₁ = Q₂ = Q/2"}, "correctAnswer": "D"},
  {"questionNumber": 16, "questionText": "The force of repulsion between two point charges is F, when these are at a distance of 0.1 m apart. Now the point charges are replaced by conducting spheres of diameter 5cm having the charge same as that of point charges. The distance between their centre is 0.1 m, then the force of repulsion will :", "questionImageURL": "", "options": {"A": "increases", "B": "decreases", "C": "remains same", "D": "4 F"}, "correctAnswer": "B"},
  {"questionNumber": 17, "questionText": "Five balls, numbered 1 to 5, are suspended using separate threads. Pairs (1, 2), (2, 4), (4, 1) show electrostatic attraction, while pairs (2, 3) and (4, 5) show repulsion. Therefore ball 1:", "questionImageURL": "", "options": {"A": "Must be positively charged.", "B": "Must be negatively charged.", "C": "Must be neutral.", "D": "May be neutral."}, "correctAnswer": "C"},
  {"questionNumber": 18, "questionText": "Two charges 4q and q are placed at a distance l apart. An another charged particle Q is placed in between them (at mid point). If resultant force on q is zero then the value of Q is:", "questionImageURL": "", "options": {"A": "q", "B": "-q", "C": "2q", "D": "-2q"}, "correctAnswer": "B"},
  {"questionNumber": 19, "questionText": "Two similar charge of +Q, as shown in figure are placed at A and B. -q charge is placed at point C midway between A and B. -q charge will oscillate if", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q19.png?alt=media", "options": {"A": "It is moved towards A.", "B": "It is moved towards B.", "C": "It is moved upwards AB.", "D": "Distance between A and B is reduced."}, "correctAnswer": "C"},
  {"questionNumber": 20, "questionText": "Two equal charges are separated by a distance d. A third charge placed on a perpendicular bisector at x distance will experience maximum coulomb force when:", "questionImageURL": "", "options": {"A": "x = d/√2", "B": "x = d/2", "C": "x = d/(2√2)", "D": "x = d/(2√3)"}, "correctAnswer": "C"},
  {"questionNumber": 21, "questionText": "Two identical small spheres carry charge of Q₁ and Q₂ with Q₁ >> Q₂. The charges are d distance apart. The force they exert on one another is F₁. The spheres are made to touch one another and then separated to distance d apart. The force they exert on one another now is F₂. Then F₁/F₂ is:", "questionImageURL": "", "options": {"A": "4Q₁/Q₂", "B": "Q₁/4Q₂", "C": "4Q₂/Q₁", "D": "Q₂/4Q₁"}, "correctAnswer": "C"},
  {"questionNumber": 22, "questionText": "Two point charges placed at a distance r in air exert a force F on each other. The value of distance R at which they experience force 4F when placed in a medium of dielectric constant K = 16 is:", "questionImageURL": "", "options": {"A": "r", "B": "r/4", "C": "r/8", "D": "2r"}, "correctAnswer": "C"},
  {"questionNumber": 23, "questionText": "Two point charges of +2 µC and +6 µC repel each other with a force of 12 N. If each is given an additional charge of -4 µC, then force will become:", "questionImageURL": "", "options": {"A": "4N (attractive)", "B": "60 N (attractive)", "C": "4 N (Repulsive)", "D": "12 N (attractive)"}, "correctAnswer": "A"},
  {"questionNumber": 24, "questionText": "A negative charge is placed at some point on the line joining the two +Q charges at rest. The direction of motion of negative charge will depend upon the :", "questionImageURL": "", "options": {"A": "position of negative charge alone.", "B": "magnitude of negative charge alone.", "C": "both on the magnitude and position of negative charge.", "D": "magnitude of positive charge."}, "correctAnswer": "A"},
  {"questionNumber": 25, "questionText": "Five point charges, each of value +q coulomb, are placed on five vertices of a regular hexagon of side L metre. The magnitude of the force on a point charge of value -q coulomb placed at the centre of the hexagon is -", "questionImageURL": "", "options": {"A": "kq²/L²", "B": "√5 * kq²/L²", "C": "√3 * kq²/L²", "D": "zero"}, "correctAnswer": "A"},
  {"questionNumber": 26, "questionText": "Force between two identical spheres charged with same charge is F. If 50% charge of one sphere is transferred to second sphere then new force will be:", "questionImageURL": "", "options": {"A": "(3/4)F", "B": "(3/8)F", "C": "(3/2)F", "D": "none"}, "correctAnswer": "A"},
  {"questionNumber": 27, "questionText": "Three equal charges (q) are placed at the corners of an equilateral triangle of side a. The force on any charge is- (K = 1/(4πε₀))", "questionImageURL": "", "options": {"A": "Zero", "B": "√3 * kq²/a²", "C": "kq²/(√3 * a²)", "D": "3√3 * kq²/a²"}, "correctAnswer": "B"},
  {"questionNumber": 28, "questionText": "Two identical metallic sphere are charged with 10 and -20 units of charge. If both the spheres are first brought into contact with each other and then are placed to their previous positions, then the ratio of the force in the two situations will be:", "questionImageURL": "", "options": {"A": "-8:1", "B": "1:8", "C": "-2:1", "D": "1:2"}, "correctAnswer": "A"},
  {"questionNumber": 29, "questionText": "The electric field in a certain region is given by E = (K/x³)i. The dimensions of K are :", "questionImageURL": "", "options": {"A": "MLT⁻³A⁻¹", "B": "ML⁻²T⁻³A⁻¹", "C": "ML⁴T⁻³A⁻¹", "D": "dimensionless"}, "correctAnswer": "C"},
  {"questionNumber": 30, "questionText": "Two point charges (+Q) and (-Q) are placed at (0, 2)m and (0, -2)m respectively. The direction of electric field on any point on X-axis is along.", "questionImageURL": "", "options": {"A": "+y axis", "B": "-y axis", "C": "+x axis", "D": "-x axis"}, "correctAnswer": "B"},
  {"questionNumber": 31, "questionText": "Two charges 9e and 3e are placed at a distance r. The distance of the point where the electric field intensity will be zero, is :", "questionImageURL": "", "options": {"A": "r/(1+√3) from 9e charge", "B": "r/(1+√(1/3)) from 9e charge", "C": "r/(1-√3) from 3e charge", "D": "r/(1-√(1/3)) from 3e charge"}, "correctAnswer": "B"},
  {"questionNumber": 32, "questionText": "Two point charges a & b, whose magnitudes are same are positioned at a certain distance from each other with a at origin. Graph is drawn between electric field strength at points between a & b and distance x from a. E is taken positive if it is along the line joining from a to b. From the graph, it can be decided that", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q32.png?alt=media", "options": {"A": "a is positive, b is negative", "B": "a and b both are positive", "C": "a and b both are negative", "D": "a is negative, b is positive"}, "correctAnswer": "A"},
  {"questionNumber": 33, "questionText": "Two charges are placed as shown in fig. Where should be a third charge be placed so that it remains in rest condition :-", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q33.png?alt=media", "options": {"A": "30cm from 9e", "B": "40cm from 16e", "C": "40cm from 9e", "D": "(1) or (2)"}, "correctAnswer": "D"},
  {"questionNumber": 34, "questionText": "Charges 2Q and -Q are placed as shown in figure. The point at which electric field intensity is zero will be:", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q34.png?alt=media", "options": {"A": "Somewhere between -Q and 2Q.", "B": "Somewhere on the left of -Q.", "C": "Somewhere on the right of 2Q.", "D": "Somewhere on the right bisector of line joining -Q and 2Q."}, "correctAnswer": "B"},
  {"questionNumber": 35, "questionText": "The rupture of air medium occurs at E = 3 x 10⁶ V/m. The maximum charge that can be given to a sphere of diameter 5 m. will be (in coulomb):", "questionImageURL": "", "options": {"A": "2 x 10⁻²", "B": "2 x 10⁻³", "C": "2 x 10⁻⁴", "D": "2 x 10⁻⁵"}, "correctAnswer": "B"},
  {"questionNumber": 36, "questionText": "The linear charge density on upper half of a segment of ring is λ and at lower half, it is -λ. The direction of electric field at centre O of ring is :", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q36.png?alt=media", "options": {"A": "along OA", "B": "along OB", "C": "along OC", "D": "along OD"}, "correctAnswer": "C"},
  {"questionNumber": 37, "questionText": "A ring of radius R is charged uniformly with a charge +Q. The electric field at any point on its axis at a distance r from the circumference of the ring will be:", "questionImageURL": "", "options": {"A": "KQ/r", "B": "KQ/r²", "C": "(KQ/r³)(r²-R²)¹/²", "D": "KQr/R³"}, "correctAnswer": "C"},
  {"questionNumber": 38, "questionText": "Semicircular ring of radius 0.5 m. is uniformly charged with a total charge of 1.4 x 10⁻⁹ C. The electric field intensity at centre of this ring is :", "questionImageURL": "", "options": {"A": "zero", "B": "320 V/m", "C": "64 V/m", "D": "32 V/m"}, "correctAnswer": "D"},
  {"questionNumber": 39, "questionText": "Two infinite linear charges are placed parallel at 0.1 m apart. If each has charge density of 5µC/m, then the force per unit length of one of linear charges in N/m is :", "questionImageURL": "", "options": {"A": "2.5", "B": "3.25", "C": "4.5", "D": "7.5"}, "correctAnswer": "C"},
  {"questionNumber": 40, "questionText": "There is a uniform electric field in x-direction. If the work done by external agent in moving a charge of 0.2 C through a distance of 2 metre slowly along the line making an angle of 60° with x direction is 4 joule, then the magnitude of E is:", "questionImageURL": "", "options": {"A": "√3 N/C", "B": "4 N/C", "C": "5 N/C", "D": "20 N/C"}, "correctAnswer": "D"},
  {"questionNumber": 41, "questionText": "The maximum electric field intensity on the axis of a uniformly charged ring of charge q and radius R will be :", "questionImageURL": "", "options": {"A": "(1/(4πε₀)) * (q/(3√3 R²))", "B": "(1/(4πε₀)) * (2q/(3R²))", "C": "(1/(4πε₀)) * (2q/(3√3 R²))", "D": "(1/(4πε₀)) * (3q/(2√3 R²))"}, "correctAnswer": "C"},
  {"questionNumber": 42, "questionText": "A charged particle of charge q and mass m is released from rest in an uniform electric field E. Neglecting the effect of gravity, the kinetic energy of the charged particle after time 't' seconds is:", "questionImageURL": "", "options": {"A": "Eqm/t", "B": "(E²q²t²)/(2m)", "C": "(2E²t²)/(mq)", "D": "(Eq²m)/(2t²)"}, "correctAnswer": "B"},
  {"questionNumber": 43, "questionText": "A charged water drop of radius 0.1 µm is under equilibrium in some electric field. The charge on the drop is equivalent to electronic charge. The intensity of electric field is (g = 10 m/s²)", "questionImageURL": "", "options": {"A": "1.61 NC⁻¹", "B": "26.2 NC⁻¹", "C": "262 NC⁻¹", "D": "1610 NC⁻¹"}, "correctAnswer": "C"},
  {"questionNumber": 44, "questionText": "A proton of mass 'm' charge 'e' is released from rest in a uniform electric field of strength 'E'. The time taken by it to travel a distance 'd' in the field is", "questionImageURL": "", "options": {"A": "√(2de/mE)", "B": "√(2dm/Ee)", "C": "√(2dE/me)", "D": "√(2Ee/dm)"}, "correctAnswer": "B"},
  {"questionNumber": 45, "questionText": "A particle of mass m and charge q is thrown at a speed u against a uniform electric field E. How much distance will it travel before coming to rest?", "questionImageURL": "", "options": {"A": "mu²/(2qE)", "B": "2mu²/qE", "C": "mqE/(2u²)", "D": "mu/qE"}, "correctAnswer": "A"},
  {"questionNumber": 46, "questionText": "Two equal and opposite charges of masses m₁ & m₂ are accelerated in a uniform electric field through the same distance. What is the ratio of magnitudes of their accelerations if their ratio of masses is m₁/m₂ = 0.5.", "questionImageURL": "", "options": {"A": "a₁/a₂ = 0.5", "B": "a₁/a₂ = 1", "C": "a₁/a₂ = 2", "D": "a₁/a₂ = 3"}, "correctAnswer": "C"},
  {"questionNumber": 47, "questionText": "A charged oil drop is suspended in uniform field of 3 x 10⁴ V/m. So that it neither falls nor rises. The charge on the drop will be (m = 9.9 x 10⁻¹⁵ kg) (g = 10 m/s²)", "questionImageURL": "", "options": {"A": "3.3 x 10⁻¹⁸ C", "B": "3.2 x 10⁻¹⁸ C", "C": "1.6 x 10⁻¹⁸ C", "D": "4.8 x 10⁻¹⁸ C"}, "correctAnswer": "A"},
  {"questionNumber": 48, "questionText": "A copper ball of density 8.6 g cm⁻³, 1 cm in diameter is immersed in oil of density 0.8 g cm⁻³. If the ball remains suspended in oil in a uniform electric field of intensity 36000 NC⁻¹ acting in upward direction, what is the charge on the ball ?", "questionImageURL": "", "options": {"A": "1.1 µC", "B": "4.2 µC", "C": "2.4 µC", "D": "3.7 µC"}, "correctAnswer": "A"},
  {"questionNumber": 49, "questionText": "If an electron is placed in a uniform electric field, then the electron will:", "questionImageURL": "", "options": {"A": "experience no force.", "B": "moving with constant velocity in the direction of the field.", "C": "move with constant velocity in the direction opposite to the field.", "D": "Accelerate in direction opposite to field."}, "correctAnswer": "D"},
  {"questionNumber": 50, "questionText": "The total flux associated with given cube will be where 'a' is side of cube: (1/ε₀ = 4π x 9 x 10⁹)", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q50.png?alt=media", "options": {"A": "162π x 10⁴ Nm²/C", "B": "162π x 10³ Nm²/C", "C": "162π x 10⁵ Nm²/C", "D": "162π x 10⁶ Nm²/C"}, "correctAnswer": "B"},
  {"questionNumber": 51, "questionText": "A point charge is placed at a distance a/2 perpendicular to the plane and above the centre of a square of side a. The electric flux through the square is :-", "questionImageURL": "", "options": {"A": "q/ε₀", "B": "q/(π ε₀)", "C": "q/(4 ε₀)", "D": "q/(6 ε₀)"}, "correctAnswer": "D"},
  {"questionNumber": 52, "questionText": "A charge q is placed at the centre of the cubical vessel (with one face open) as shown in figure. The flux of the electric field through the surface of the vessel is:", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q52.png?alt=media", "options": {"A": "zero", "B": "q/ε₀", "C": "q/(4ε₀)", "D": "5q/(6ε₀)"}, "correctAnswer": "D"},
  {"questionNumber": 53, "questionText": "Eight charges, 1µC, -7µC, -4µC, 10µC, 2µC, -5µC, -3µC and 6µC are situated at the eight corners of a cube of side 20 cm. A spherical surface of radius 80 cm encloses this cube. The centre of the sphere coincides with the centre of the cube. Then the total outgoing flux from the spherical surface (in unit of volt meter) is :", "questionImageURL": "", "options": {"A": "36π x 10³", "B": "684π x 10³", "C": "zero", "D": "none of the above"}, "correctAnswer": "C"},
  {"questionNumber": 54, "questionText": "Which of the following represents the correct graph for electric field intensity and the distance r from the centre of a hollow charged metal sphere or solid metallic conductor of radius R:", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q54.png?alt=media", "options": {"A": "Graph 1", "B": "Graph 2", "C": "Graph 3", "D": "Graph 4"}, "correctAnswer": "D"},
  {"questionNumber": 55, "questionText": "A sphere of radius R and charge Q is placed inside an imaginary sphere of radius 2R whose centre coincides with the given sphere. The flux related to imaginary sphere is :", "questionImageURL": "", "options": {"A": "Q/ε₀", "B": "Q/(2ε₀)", "C": "4Q/ε₀", "D": "2Q/ε₀"}, "correctAnswer": "A"},
  {"questionNumber": 56, "questionText": "The intensity of an electric field at some point distant r from the axis of infinite long pipe having charges per unit length as q will be :", "questionImageURL": "", "options": {"A": "proportional to r²", "B": "proportional to r³", "C": "inversely proportional to r", "D": "inversely proportional to r²"}, "correctAnswer": "C"},
  {"questionNumber": 57, "questionText": "A closed cylinder of radius R and length L is placed in a uniform electric field E, parallel to the axis of the cylinder. Then the electric flux through the cylinder must be -", "questionImageURL": "", "options": {"A": "2πR²E", "B": "(2πR² + 2πRL)E", "C": "2πRLE", "D": "zero"}, "correctAnswer": "D"},
  {"questionNumber": 58, "questionText": "In a region of space the electric field is given by E = 8i + 4j + 3k. The electric flux through a surface of area of 100 units in x-y plane is:", "questionImageURL": "", "options": {"A": "800 units", "B": "300 units", "C": "400 units", "D": "1500 units"}, "correctAnswer": "B"},
  {"questionNumber": 59, "questionText": "An electric field given by E = 4i + 3(y²+2)j places Gaussian cube of side 1m placed at origin such that its three sides represents x, y and z axes. The net charges enclosed within the cube is:", "questionImageURL": "", "options": {"A": "4ε₀", "B": "3ε₀", "C": "5ε₀", "D": "Zero"}, "correctAnswer": "B"},
  {"questionNumber": 60, "questionText": "Which one of the following pattern of electrostatics line of force can't possible : -", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q60.png?alt=media", "options": {"A": "Pattern 1", "B": "Pattern 2", "C": "Pattern 3", "D": "Pattern 4"}, "correctAnswer": "C"},
  {"questionNumber": 61, "questionText": "The lines of force of the electric field due to two charges q and Q are sketched in the figure then :", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q61.png?alt=media", "options": {"A": "Q is positive and |Q| > |q|", "B": "Q is negative and |Q| > |q|", "C": "q is positive and |Q| < |q|", "D": "q is negative and |Q| < |q|"}, "correctAnswer": "C"},
  {"questionNumber": 62, "questionText": "The given figure gives electric lines of force due to two charges q₁ and q₂. What are the signs of the two charges ?", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q62.png?alt=media", "options": {"A": "Both are negative", "B": "Both are positive", "C": "q₁ is positive but q₂ is negative", "D": "q₁ is negative but q₂ is positive"}, "correctAnswer": "A"},
  {"questionNumber": 63, "questionText": "Two large sized charged plates have a charge density of +σ and -σ. The resultant force on the proton located midway between them will be :", "questionImageURL": "", "options": {"A": "σe/ε₀", "B": "σe/(2ε₀)", "C": "2σe/ε₀", "D": "zero"}, "correctAnswer": "A"},
  {"questionNumber": 64, "questionText": "An infinitely large non-conducting plane of uniform surface charge density σ has circular aperture of certain radius curved out from it. The electric field at a point which is at a distance 'a' from the centre of the aperture (perpendicular to the plane) is σ/(2√2 ε₀). Find the radius of aperture?", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q64.png?alt=media", "options": {"A": "√2 a", "B": "3a", "C": "2a", "D": "a"}, "correctAnswer": "D"},
  {"questionNumber": 65, "questionText": "A charge 'q' is placed at the centre of a conducting spherical shell of radius R, having charge Q. An external charge Q' is also present at distance R' (R' > R) from 'q'. The resultant field will be best represented for region r < R by: [where r is the distance of the point from q]", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q65.png?alt=media", "options": {"A": "Graph 1", "B": "Graph 2", "C": "Graph 3", "D": "Graph 4"}, "correctAnswer": "A"},
  {"questionNumber": 66, "questionText": "In the above question, if Q' is removed then which option is correct:", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q66.png?alt=media", "options": {"A": "Graph 1", "B": "Graph 2", "C": "Graph 3", "D": "Graph 4"}, "correctAnswer": "A"},
  {"questionNumber": 67, "questionText": "A nonconducting solid sphere of radius R is uniformly charged. The magnitude of the electric field due to the sphere at a distance r from its centre:", "questionImageURL": "", "options": {"A": "a, c", "B": "c, d", "C": "a, b", "D": "b, d"}, "correctAnswer": "A"},
  {"questionNumber": 68, "questionText": "A solid metallic sphere has a charge +3Q. Concentric with this sphere is a conducting spherical shell having charge -Q. The radius of the sphere is a and that of the spherical shell is b (>a). What is the electric field at a distance r (a < r < b) from the centre?", "questionImageURL": "", "options": {"A": "(1/(4πε₀)) * (3Q/r)", "B": "(1/(4πε₀)) * (3Q/r²)", "C": "(1/(4πε₀)) * (3Q/r³)", "D": "(1/(4πε₀)) * (Q/r²)"}, "correctAnswer": "C"},
  {"questionNumber": 69, "questionText": "Total charge on a sphere of radii 10 cm is 1 µC. The maximum electric field due to the sphere in N/C will be:", "questionImageURL": "", "options": {"A": "9 x 10⁻⁵", "B": "9 x 10³", "C": "9 x 10⁵", "D": "9 x 10¹⁵"}, "correctAnswer": "C"},
  {"questionNumber": 70, "questionText": "Two charged spheres having radii a and b are joined with a wire then the ratio of electric field Eₐ/Eₑ on their surface is :", "questionImageURL": "", "options": {"A": "a/b", "B": "b/a", "C": "a²/b²", "D": "b²/a²"}, "correctAnswer": "B"},
  {"questionNumber": 71, "questionText": "Which statement is true : (i) A ring of radius R carries a uniformly distributed charge +Q. A point charge -q is placed on the axis of the ring at a distance 2R from the centre of the ring and released from rest. The particle executes a simple harmonic motion along the axis of the ring. (ii) Electrons move from a region of higher potential to that of lower potential.", "questionImageURL": "", "options": {"A": "only (i)", "B": "only (ii)", "C": "(i), (ii)", "D": "none of them"}, "correctAnswer": "D"},
  {"questionNumber": 72, "questionText": "A particle A has charge +q and particle B has charge +4q with each of them having the same mass m. When allowed to fall from rest through same electrical potential difference, the ratio of their speed vₐ:vₑ will be :", "questionImageURL": "", "options": {"A": "2:1", "B": "1:2", "C": "4:1", "D": "1:4"}, "correctAnswer": "B"},
  {"questionNumber": 73, "questionText": "As shown in figure, on bringing a charge Q from point A to B and from B to C, the work done are 2 joule and -3 joule respectively. The work done in bringing the charge from C to A will be:", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q73.png?alt=media", "options": {"A": "-1 joule", "B": "1 joule", "C": "2 joule", "D": "5 joule"}, "correctAnswer": "B"},
  {"questionNumber": 74, "questionText": "In an electron gun, electrons are accelerated through a potential difference of V volt. Taking electronic charge and mass to be respectively e and m, the maximum velocity attained by them is:", "questionImageURL": "", "options": {"A": "2eV/m", "B": "√(2eV/m)", "C": "2m/eV", "D": "V²/(2em)"}, "correctAnswer": "B"},
  {"questionNumber": 75, "questionText": "In a cathode ray tube, if V is the potential difference between the cathode and anode, the speed of the electrons, when they reach the anode is proportional to: (Assume initial velocity = 0)", "questionImageURL": "", "options": {"A": "V", "B": "1/V", "C": "√V", "D": "V²/ (2em)"}, "correctAnswer": "C"},
  {"questionNumber": 76, "questionText": "An electron moving in a electric potential field V₁ enters a higher electric potential field V₂, then the change in kinetic energy of the electron is proportional to:", "questionImageURL": "", "options": {"A": "(V₂-V₁)¹/²", "B": "V₂-V₁", "C": "(V₂-V₁)²", "D": "(V₂-V₁)/V₂"}, "correctAnswer": "B"},
  {"questionNumber": 77, "questionText": "If a charge is shifted from a low potential region to high potential region. The electrical potential energy:", "questionImageURL": "", "options": {"A": "Increases", "B": "Decreases", "C": "Remains constant", "D": "May increase or decrease."}, "correctAnswer": "D"},
  {"questionNumber": 78, "questionText": "You are given an arrangement of three point charges q, 2q and xq separated by equal finite distances so that electric potential energy of the system is zero. Then the value of x is:", "questionImageURL": "", "options": {"A": "-2/3", "B": "-1/3", "C": "2/3", "D": "3/2"}, "correctAnswer": "A"},
  {"questionNumber": 79, "questionText": "A charge q = 10⁻⁶ C of mass 2 g (fig.) is free to move then calculate its speed, when it is at a distance of b. [Assume a = 1m, b = 10m, Q = 10⁻³ C]", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q79.png?alt=media", "options": {"A": "90 m/s.", "B": "9 m/s.", "C": "900 m/s.", "D": "none of these"}, "correctAnswer": "A"},
  {"questionNumber": 80, "questionText": "A sphere of radius 1 cm has potential of 8000 V. The energy density near the surface of sphere will be:", "questionImageURL": "", "options": {"A": "64 x 10⁵ J/m³", "B": "8 x 10³ J/m³", "C": "32 J/m³", "D": "2.83 J/m³"}, "correctAnswer": "D"},
  {"questionNumber": 81, "questionText": "Two spheres of radii 2 cm and 4 cm are charged equally, then the ratio of charge density on the surfaces of the spheres will be :", "questionImageURL": "", "options": {"A": "1:2", "B": "4:1", "C": "8:1", "D": "1:4"}, "correctAnswer": "B"},
  {"questionNumber": 82, "questionText": "Three charges are placed as shown in fig. If the electric potential energy of system is zero, then Q:q is-", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q82.png?alt=media", "options": {"A": "Q/q = -2/1", "B": "Q/q = 2/1", "C": "Q/q = -1/2", "D": "Q/q = 1/4"}, "correctAnswer": "A"},
  {"questionNumber": 83, "questionText": "A point positive charge of Q' units is moved round another point positive charge of Q units in circular path. If the radius of the circle is r. The work done on the charge Q' in making one complete revolution is -", "questionImageURL": "", "options": {"A": "Q/(4πε₀r)", "B": "QQ'/(4πε₀r)", "C": "Q'/(4πε₀r)", "D": "Zero"}, "correctAnswer": "D"},
  {"questionNumber": 84, "questionText": "Two equal charges q are placed at a distance of 2a and a third charge -2q is placed at the midpoint. The potential energy of the system is", "questionImageURL": "", "options": {"A": "(8q²)/(7πε₀a)", "B": "(7q²)/(8πε₀a)", "C": "(-7q²)/(8πε₀a)", "D": "None of these"}, "correctAnswer": "C"},
  {"questionNumber": 85, "questionText": "The electrostatic potential energy between proton and a α-particle separated by a distance 2 Å is:", "questionImageURL": "", "options": {"A": "20 x 10⁻¹⁸ J", "B": "2.3 x 10⁻¹⁸ J", "C": "34 x 10⁻¹⁹ J", "D": "None of these"}, "correctAnswer": "B"},
  {"questionNumber": 86, "questionText": "If identical charges (-q) are placed at each corner of a cube of side b, then electric potential energy of charge (+q) which is placed at centre of the cube will be", "questionImageURL": "", "options": {"A": "(8√2 q²)/(4πε₀b)", "B": "(-8√2 q²)/(πε₀b)", "C": "(-4√2 q²)/(πε₀b)", "D": "(-4q²)/(√3 πε₀b)"}, "correctAnswer": "D"},
  {"questionNumber": 87, "questionText": "At distance 'r' from a point charge, the ratio U/V² (where 'U' is energy density and 'V' is potential) is best represented by:", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q87.png?alt=media", "options": {"A": "Graph 1", "B": "Graph 2", "C": "Graph 3", "D": "Graph 4"}, "correctAnswer": "B"},
  {"questionNumber": 88, "questionText": "Under the influence of charge, a point charge q is carried along different paths from a point A to point B, then work done will be:", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q88.png?alt=media", "options": {"A": "maximum for path four", "B": "maximum for path one", "C": "equal for all paths", "D": "minimum for path three"}, "correctAnswer": "C"},
  {"questionNumber": 89, "questionText": "A particle of charge Q and mass m travels through a potential difference V from rest. The final momentum of the particle is:", "questionImageURL": "", "options": {"A": "mV/Q", "B": "2Q√(mV)", "C": "√(2mQV)", "D": "√(2QV/m)"}, "correctAnswer": "C"},
  {"questionNumber": 90, "questionText": "A 5C charge experiences a force of 2000 N when moved between two points separated by a distance of 2 cm in a uniform electric field. The potential difference between the two points is:", "questionImageURL": "", "options": {"A": "8 volt", "B": "80 volt", "C": "800 volt", "D": "8000 volt"}, "correctAnswer": "A"},
  {"questionNumber": 91, "questionText": "The work done to take an electron from rest where potential is 60 volt to another point where potential is -20 volt is given by :", "questionImageURL": "", "options": {"A": "40 eV", "B": "-40 eV", "C": "60 eV", "D": "-60eV"}, "correctAnswer": "B"},
  {"questionNumber": 92, "questionText": "Work done in carrying an electric charge Q₁ once round a circle of radius R with a charge Q₂ at the center of the circle is", "questionImageURL": "", "options": {"A": "Q₁Q₂/(4πε₀R)", "B": "infinity", "C": "Q₁/(4πε₀R)", "D": "Zero"}, "correctAnswer": "D"},
  {"questionNumber": 93, "questionText": "If 20 J of work has to be done to move an electric charge of 4C from a point where potential is 10 V to another point where potential is V volt find the value of V:", "questionImageURL": "", "options": {"A": "2 V", "B": "70 V", "C": "5 V", "D": "15 V"}, "correctAnswer": "D"},
  {"questionNumber": 94, "questionText": "Two points A and B are maintained at the potentials of 18 V and -5V respectively. What will be the work done in moving 150 α-particles from B to A?", "questionImageURL": "", "options": {"A": "4 x 10⁻¹² J", "B": "8 x 10⁻⁸ J", "C": "2 x 10⁻¹⁵ J", "D": "1.1 x 10⁻¹⁵ J"}, "correctAnswer": "D"},
  {"questionNumber": 95, "questionText": "15 joule of work has to be done against an existing electric field to take a charge of 0.01 C from A to B. Then the potential difference (Vₑ - Vₐ) is:", "questionImageURL": "", "options": {"A": "1500 volt", "B": "-1500 volt", "C": "0.15 volt", "D": "none of these"}, "correctAnswer": "A"},
  {"questionNumber": 96, "questionText": "In H atom, an electron is rotating around the proton in an orbit of radius r. Work done by an electron in moving once around the proton along the orbit will be :", "questionImageURL": "", "options": {"A": "ke/r", "B": "ke²/r²", "C": "2πre", "D": "zero"}, "correctAnswer": "D"},
  {"questionNumber": 97, "questionText": "Choose the incorrect statement:", "questionImageURL": "", "options": {"A": "The potential energy per unit positive charge in an electric field at some point is called the electric potential.", "B": "The work required to be done to move a point charge from one point to another in an electric field depends on the position of the points.", "C": "The potential energy of the system will increase if a positive charge is moved against of Coulombian force.", "D": "The value of fundamental charge is not equivalent to the electronic charge."}, "correctAnswer": "D"},
  {"questionNumber": 98, "questionText": "The dimensions of potential difference are :", "questionImageURL": "", "options": {"A": "ML²T⁻²Q⁻¹", "B": "MLT⁻²Q⁻¹", "C": "MT⁻²Q⁻²", "D": "ML²T⁻¹Q⁻¹"}, "correctAnswer": "A"},
  {"questionNumber": 99, "questionText": "An object is charged with positive charge. The potential at that object will be :", "questionImageURL": "", "options": {"A": "positive only", "B": "negative only", "C": "zero always", "D": "may be positive, negative or zero."}, "correctAnswer": "D"},
  {"questionNumber": 100, "questionText": "Two points (0, a) and (0, -a) have charges q and -q respectively then the electrical potential at origin will be-", "questionImageURL": "", "options": {"A": "zero", "B": "kq/a", "C": "kq/2a", "D": "kq/4a²"}, "correctAnswer": "A"},
  {"questionNumber": 101, "questionText": "The charges of same magnitude q are placed at four corners of a square of side a. The value of potential at the centre of square will be :", "questionImageURL": "", "options": {"A": "4kq/a", "B": "4√2 kq/a", "C": "4kq√2a", "D": "kq/a√2"}, "correctAnswer": "B"},
  {"questionNumber": 102, "questionText": "A circle of radius R is drawn in a uniform electric field E as shown in the fig. Vₐ, Vₑ, Vₒ and Vₐ are respectively the potential of point A, B, C and D at the periphery of the circle then", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q102.png?alt=media", "options": {"A": "Vₐ > Vₒ, Vₑ = Vₐ", "B": "Vₐ < Vₒ, Vₑ = Vₐ", "C": "Vₐ = Vₒ, Vₑ < Vₐ", "D": "Vₐ = Vₒ, Vₑ > Vₐ"}, "correctAnswer": "C"},
  {"questionNumber": 103, "questionText": "Figure represents a square carrying charges +q, +q, -q, -q at its four corners as shown. Then the potential will be zero at points:", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q103.png?alt=media", "options": {"A": "A, B, C, P and Q", "B": "A, B and C", "C": "A, P, C and Q", "D": "P, B and Q"}, "correctAnswer": "B"},
  {"questionNumber": 104, "questionText": "Two equal positive charges are kept at points A and B. The electric potential at the points between A and B (excluding these points) is studied while moving from A to B. The potential:", "questionImageURL": "", "options": {"A": "continuously increases", "B": "continuously decreases", "C": "increases then decreases", "D": "decreases then increases"}, "correctAnswer": "D"},
  {"questionNumber": 105, "questionText": "An infinite number of charges of equal magnitude q, but alternate charge of opposite sign are placed along the x-axis at x = 1m, x = 2m, x = 4m, x = 8m,.. and so on. The electric potential at the point x = 0 due to all these charges will be:", "questionImageURL": "", "options": {"A": "kq/2", "B": "kq/3", "C": "2kq/3", "D": "3kq/2"}, "correctAnswer": "C"},
  {"questionNumber": 106, "questionText": "A semicircular ring of radius 0.5 m is uniformly charged with a total charge of 1.5 x 10⁻⁹. The electric potential at the centre of this ring is :", "questionImageURL": "", "options": {"A": "27 V", "B": "13.5 V", "C": "54 V", "D": "45.5 V"}, "correctAnswer": "A"},
  {"questionNumber": 107, "questionText": "A wire of 5 m length carries a steady current. If it has an electric field of 0.2 V/m. the potential difference across the wire in volt will be :", "questionImageURL": "", "options": {"A": "25", "B": "0.04", "C": "1.0", "D": "none of the above"}, "correctAnswer": "C"},
  {"questionNumber": 108, "questionText": "The fig. shows lines of constant potential in a region in which an electric field is present. The value of the potential are given. The magnitude of the electric field is greatest at the point:", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q108.png?alt=media", "options": {"A": "A", "B": "B", "C": "C", "D": "A & C"}, "correctAnswer": "B"},
  {"questionNumber": 109, "questionText": "Three equal charges are placed at the three corners of an equilateral triangle as shown in the figure. The statement which is true for electric potential V and the field intensity E at the centre of the triangle:", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q109.png?alt=media", "options": {"A": "V = 0, E = 0", "B": "V = 0, E ≠ 0", "C": "V ≠ 0, E = 0", "D": "V ≠ 0, E ≠ 0"}, "correctAnswer": "C"},
  {"questionNumber": 110, "questionText": "Electric field at a distance x from origin is given as E = 100/x². then potential difference between points situated at x = 10 m and x = 20 m :", "questionImageURL": "", "options": {"A": "5 V", "B": "10 V", "C": "15 V", "D": "4V"}, "correctAnswer": "A"},
  {"questionNumber": 111, "questionText": "The electric potential V is given as a function of distance x (metre) by V = (5x² - 10x - 9) volt. Value of electric field at x = 1 m is :-", "questionImageURL": "", "options": {"A": "20 V/m", "B": "6 V/m", "C": "11 V/m", "D": "zero"}, "correctAnswer": "D"},
  {"questionNumber": 112, "questionText": "The variation of potential with distance r from a fixed point is shown in Figure. The electric field at r = 5 cm, is:", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q112.png?alt=media", "options": {"A": "(2.5) V/cm", "B": "(-2.5) V/cm", "C": "-2/5 V/cm", "D": "2/5 V/cm"}, "correctAnswer": "A"},
  {"questionNumber": 113, "questionText": "The electric potential and electric field at any given position due to a point charge are 600 V and 200 N/C respectively. Then magnitude of point charge would be :", "questionImageURL": "", "options": {"A": "3 µC", "B": "30 µC", "C": "0.2 µC", "D": "0.5 µC"}, "correctAnswer": "C"},
  {"questionNumber": 114, "questionText": "Four charges 2C, -3C, -4C and 5C respectively are placed at all the corners of a square. Which of the following statements is true for the point of intersection of the diagonals:", "questionImageURL": "", "options": {"A": "E = 0, V = 0", "B": "E ≠ 0, V = 0", "C": "E = 0, V ≠ 0", "D": "E ≠ 0, V ≠ 0"}, "correctAnswer": "B"},
  {"questionNumber": 115, "questionText": "Electric potential at any point is V = -5x + 3y + √15 z then the magnitude of the electric field is-", "questionImageURL": "", "options": {"A": "3√2", "B": "4√2", "C": "5√2", "D": "7"}, "correctAnswer": "D"},
  {"questionNumber": 116, "questionText": "The electric field in a region is directed outward and is proportional to the distance r from the origin. Taking the electric potential at the origin to be zero, the electric potential at a distance r:", "questionImageURL": "", "options": {"A": "is uniform in the region", "B": "is proportional to r", "C": "is proportional to r²", "D": "increases as one goes away from the origin"}, "correctAnswer": "C"},
  {"questionNumber": 117, "questionText": "The electric field and the electric potential at a point are E and V respectively", "questionImageURL": "", "options": {"A": "If E = 0, V must be zero.", "B": "If V = 0, E must be zero.", "C": "If E ≠ 0, V cannot be zero.", "D": "None of these"}, "correctAnswer": "D"},
  {"questionNumber": 118, "questionText": "For the given figure the direction of electric field at A will be :", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q118.png?alt=media", "options": {"A": "towards AL", "B": "towards AY", "C": "towards AX", "D": "towards AZ"}, "correctAnswer": "B"},
  {"questionNumber": 119, "questionText": "An electric dipole is placed in an electric field generated by a point charge :", "questionImageURL": "", "options": {"A": "The net electric force on the dipole must be zero.", "B": "The net electric force on the dipole may be zero.", "C": "The torque on the dipole due to the field must be zero.", "D": "The torque on the dipole due to the field may be zero."}, "correctAnswer": "D"},
  {"questionNumber": 120, "questionText": "The force on a charge situated on the axis of a dipole is F. If the charge is shifted to double the distance, the acting force will be:", "questionImageURL": "", "options": {"A": "4F", "B": "F/2", "C": "F/4", "D": "F/8"}, "correctAnswer": "D"},
  {"questionNumber": 121, "questionText": "The electric potential at a point due to an electric dipole will be:", "questionImageURL": "", "options": {"A": "k(P.r)/r³", "B": "k(P.r)/r²", "C": "k(P x r)/r³", "D": "k(P x r)/r²"}, "correctAnswer": "A"},
  {"questionNumber": 122, "questionText": "A small electric dipole is of dipole moment p. The electric potential at a distance 'r' from its centre and making an angle θ from the axis of dipole will be:", "questionImageURL": "", "options": {"A": "(kp sinθ)/r²", "B": "(kp cosθ)/r²", "C": "(kp/r³)√(1+3cos²θ)", "D": "(kp/r³)√(1+3sin²θ)"}, "correctAnswer": "B"},
  {"questionNumber": 123, "questionText": "At any point on the right bisector of line joining two equal and opposite charges :", "questionImageURL": "", "options": {"A": "the electric field is zero.", "B": "the electric potential is zero.", "C": "the electric potential decreases with increasing distance from centre.", "D": "the electric field is perpendicular to the line joining the charges."}, "correctAnswer": "B"},
  {"questionNumber": 124, "questionText": "The region surrounding a stationary electric dipole has-", "questionImageURL": "", "options": {"A": "electric field only", "B": "magnetic field only", "C": "both electric and magnetic fields", "D": "neither electric nor magnetic field"}, "correctAnswer": "A"},
  {"questionNumber": 125, "questionText": "An electric dipole is made up of two equal and opposite charges of 2 x 10⁻⁶ coulomb at a distance of 3 cm. This is kept in an electric field of 2 x 10⁵ N/C, then the maximum torque acting on the dipole :", "questionImageURL": "", "options": {"A": "12 x 10⁻¹ Nm", "B": "12 x 10⁻³ Nm", "C": "24 x 10⁻³ Nm", "D": "24 x 10⁻¹ Nm"}, "correctAnswer": "B"},
  {"questionNumber": 126, "questionText": "The electric potential in volt due to an electric dipole of dipole moment 2 x 10⁻⁸ C-m at a distance of 3m on a line making an angle of 60° with the axis of the dipole is:", "questionImageURL": "", "options": {"A": "0", "B": "10", "C": "20", "D": "40"}, "correctAnswer": "B"},
  {"questionNumber": 127, "questionText": "If an electric dipole is kept in a non-uniform electric field, then it will experience :", "questionImageURL": "", "options": {"A": "only torque", "B": "no torque", "C": "a resultant force and a torque", "D": "only a force"}, "correctAnswer": "C"},
  {"questionNumber": 128, "questionText": "What is the magnitude of electric field intensity due to a dipole of moment 4 x 10⁻⁸ C-m at a point distant 0.5m from the center of dipole when line joining the point to the center of dipole makes an angle of 60° with dipole axis?", "questionImageURL": "", "options": {"A": "4 x 10⁻⁵ N/C", "B": "5 x 10⁻¹¹ N/C", "C": "2 x 10⁷ N/C", "D": "3.8 x 10³ N/C"}, "correctAnswer": "D"},
  {"questionNumber": 129, "questionText": "A water molecule has an electric dipole moment 7 x 10⁻³⁰ C-m when it is in vapour state. The distance between the center of positive and negative charge of the molecule is", "questionImageURL": "", "options": {"A": "5 x 10⁻¹¹ m", "B": "2 x 10⁻¹¹ m", "C": "4.1 x 10⁻¹ m", "D": "4.375 x 10⁻¹¹ m"}, "correctAnswer": "D"},
  {"questionNumber": 130, "questionText": "Three point charges -Q, +Q and +Q are placed on a straight line with distance d between charges as shown. Find the magnitude of the electric field at the point P in the configuration shown which is at a distance a from middle charge Q in the system provided that a >> d. Take 2Qd = p.", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q130.png?alt=media", "options": {"A": "(1/(4πε₀a²))√(Q²a²+p²)", "B": "(1/(4πε₀a³))√(Q²a²+p²)", "C": "(1/(4πε₀a³))√(Q²a²+p)", "D": "(1/(4πε₀a))√(Q²a²+p²)"}, "correctAnswer": "B"},
  {"questionNumber": 131, "questionText": "An electric dipole of dipole moment 2 x 10⁻¹² C-m is oriented at an angle of 60° with electric field of intensity 3NC⁻¹. What work need to be done to turn the dipole so that it becomes anti-parallel to the field?", "questionImageURL": "", "options": {"A": "12 x 10⁻¹² J", "B": "-9 x 10⁻¹² J", "C": "9 x 10⁻¹² J", "D": "-12 x 10⁻¹² J"}, "correctAnswer": "C"},
  {"questionNumber": 132, "questionText": "An electric dipole is along a uniform electric field. If it is deflected by 60°, work done by an agent is 2 x 10⁻¹⁹ J. Then the work done by an agent if it is deflected by 30° further is", "questionImageURL": "", "options": {"A": "2.5 x 10⁻¹⁹ J", "B": "2 x 10⁻¹⁹ J", "C": "4 x 10⁻¹⁹ J", "D": "2 x 10⁻¹⁶ J"}, "correctAnswer": "B"},
  {"questionNumber": 133, "questionText": "The dipole moment of the given system is", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q133.png?alt=media", "options": {"A": "√3 ql along perpendicular bisector of q-q line", "B": "2ql along perpendicular bisector of q-q line", "C": "ql√2 along perpendicular bisector of q-q line", "D": "0"}, "correctAnswer": "A"},
  {"questionNumber": 134, "questionText": "If 'n' identical water drops assumed spherical each charged to a potential energy U coalesce to a single drop, the potential energy of the single drop is (Assume that drops are uniformly charged):", "questionImageURL": "", "options": {"A": "n¹/³ U", "B": "n²/³ U", "C": "n⁴/³ U", "D": "n⁵/³ U"}, "correctAnswer": "D"},
  {"questionNumber": 135, "questionText": "64 charged drops coalesce to from a bigger charged drop. The potential of bigger drop will be ____ times that of smaller drop :", "questionImageURL": "", "options": {"A": "4", "B": "16", "C": "64", "D": "8"}, "correctAnswer": "B"},
  {"questionNumber": 136, "questionText": "A spherical droplet having a potential of 2.5 volt is obtained as a result of merging of 125 identical droplets. Find the potential of the constituent droplet :", "questionImageURL": "", "options": {"A": "0.4 V", "B": "0.5 V", "C": "0.1 V", "D": "62.5 V"}, "correctAnswer": "C"},
  {"questionNumber": 137, "questionText": "27 smaller drop combine to form a bigger drop if potential on smaller drop is V then potential on bigger drop will be-", "questionImageURL": "", "options": {"A": "9V", "B": "3V", "C": "27V", "D": "1/3 V"}, "correctAnswer": "A"},
  {"questionNumber": 138, "questionText": "For an electrostatic system which of the statement is always true: (a) electric lines are parallel to metallic surface. (b) electric field inside a metallic surface is zero. (c) electric lines of force are perpendicular to equi-potential surface.", "questionImageURL": "", "options": {"A": "(a) and (b) only", "B": "(b) and (c) only", "C": "(a) and (c) only", "D": "(a), (b) and (c)"}, "correctAnswer": "B"},
  {"questionNumber": 139, "questionText": "The dielectric constant of a metal is:", "questionImageURL": "", "options": {"A": "infinity", "B": "0", "C": "1", "D": "none of these"}, "correctAnswer": "A"},
  {"questionNumber": 140, "questionText": "You are travelling in a car during a thunder storm, in order to protect yourself from lightening would you prefer to :", "questionImageURL": "", "options": {"A": "Remain in the car.", "B": "Take shelter under a tree.", "C": "Get out and be flat on the ground.", "D": "Touch the nearest electrical pole."}, "correctAnswer": "A"},
  {"questionNumber": 141, "questionText": "Two conductors of the same shape and size. One of copper and the other of aluminium (less conducting) are placed in an uniform electric field. The charge induced in aluminium", "questionImageURL": "", "options": {"A": "will be less than in copper.", "B": "will be more than in copper.", "C": "will be equal to that in copper.", "D": "will not be connected with copper."}, "correctAnswer": "C"},
  {"questionNumber": 142, "questionText": "The electric field near the conducting surface of a uniform charge density σ will be -", "questionImageURL": "", "options": {"A": "σ/ε₀ and parallel to surface.", "B": "2σ/ε₀ and parallel to surface.", "C": "σ/ε₀ and perpendicular to surface.", "D": "2σ/ε₀ and perpendicular to surface."}, "correctAnswer": "C"},
  {"questionNumber": 143, "questionText": "Two conducting spheres of radius 10 cm and 20 cm are given a charge of 15µC each. After the two spheres are joined by a conducting wire, the charge on the smaller sphere is-", "questionImageURL": "", "options": {"A": "5 µC", "B": "10 µC", "C": "15 µC", "D": "20 µC"}, "correctAnswer": "B"},
  {"questionNumber": 144, "questionText": "An uncharged conductor A is brought close to another positive charged conductor B, then the charge on B:", "questionImageURL": "", "options": {"A": "will increase", "B": "will decrease.", "C": "will be constant", "D": "none of these"}, "correctAnswer": "C"},
  {"questionNumber": 145, "questionText": "A neutral metallic object is placed near a finite metal plate carrying a positive charge. The electric force on the object will be:", "questionImageURL": "", "options": {"A": "towards the plate", "B": "away from the plate", "C": "parallel to the plate", "D": "zero"}, "correctAnswer": "A"},
  {"questionNumber": 146, "questionText": "The net charge given to an isolated conducting solid sphere:", "questionImageURL": "", "options": {"A": "must be distributed uniformly on surface.", "B": "may be distributed uniformly on the surface.", "C": "must be distributed uniformly in the volume.", "D": "may be distributed uniformly in the volume."}, "correctAnswer": "A"},
  {"questionNumber": 147, "questionText": "A conducting shell of radius 10 cm is charged with 3.2 x 10⁻¹⁹ C. The electric potential at a distance 4cm from its centre in volt be -", "questionImageURL": "", "options": {"A": "9 x 10⁻⁹", "B": "2.88 x 10⁻⁸", "C": "288 x 10⁻⁸", "D": "zero"}, "correctAnswer": "B"},
  {"questionNumber": 148, "questionText": "If three sphere A, B and C of radius in the ratio 1:3:5 carry charge 10C, -30C, 50C respectively. If these spheres are connected by a conducting wire then what will be the new charge on sphere B.", "questionImageURL": "", "options": {"A": "-10C", "B": "+10C", "C": "+20C", "D": "-20C"}, "correctAnswer": "B"},
  {"questionNumber": 149, "questionText": "Charge on the outer sphere is q, and the inner sphere is grounded. Then the charge on the inner sphere is q', for (r₂ > r₁)", "questionImageURL": "https://firebasestorage.googleapis.com/v0/b/neet-trackr.appspot.com/o/topicwise_q149.png?alt=media", "options": {"A": "Zero", "B": "q' = q", "C": "q' = -(r₁/r₂)q", "D": "q' = (r₁/r₂)q"}, "correctAnswer": "D"}
];

// Combine the two sets of questions to be used in the page component.
// This is not ideal as we might want to separate them later, but for now this will do.
export const allNlmQuestions = {
    'topic-wise-questions': nlmQuestions,
    'neet-rankers-stuff': nlmRankersQuestions
}
