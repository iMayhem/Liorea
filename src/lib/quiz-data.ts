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
            "C": "u = (π * F₀ * T)/(2*m)",
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

// Combine the two sets of questions to be used in the page component.
// This is not ideal as we might want to separate them later, but for now this will do.
export const allNlmQuestions = {
    'topic-wise-questions': nlmQuestions,
    'neet-rankers-stuff': nlmRankersQuestions
}
