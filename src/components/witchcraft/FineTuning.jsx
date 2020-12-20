import React from 'react';
import NumberInput from '../shared/NumberInput.jsx';
import { deepCopy, getRandomInt } from '../../utils.js';
import {
  crafterHasTechnique,
  projectUsedTechnique,
  getTotalFlawBoonStack,
  didProjectSucceed,
  allFlaws,
  allBoons,
  getManufacturerCount,
} from './data.js';

import './FineTuning.scss';

const FineTuning = ({
  crafterData,
  projectData,
  updateProjectData
}) => {
  // const [manualAddValue, setManualAddValue] = useState(0);

  const cancelledCount = projectData.cancelledCount;
  const flawStack = getTotalFlawBoonStack(projectData.rollData.flawCount, projectData);
  const boonStack = getTotalFlawBoonStack(projectData.rollData.boonCount, projectData);

  const handleBoonFlawClick = (wasAlreadyCancelled) => {
    var newCount = cancelledCount;
    if (wasAlreadyCancelled) {newCount -= 1} else {newCount += 1}

    // can't cancel out more than we have of the opposite
    newCount = Math.min(newCount, projectData.rollData.flawCount);
    newCount = Math.min(newCount, projectData.rollData.boonCount);

    updateProjectData({cancelledCount: newCount})
  }

  // ======== ADD DICE, BONUSES, AND TECHNIQUE DATA ======== //

  // dice: rolls that many dice, adds boons and flaws accordingly
  // roll: adds a specific roll, adds boon or flaw accordingly
  // bonus: adds a flat bonus, no flaws or boons
  // boonCount: adds this many boons
  // flawCount: adds this many flaws
  // technique: appends technique name
  // techniqueDetails: sets technique detail data
  // removeLowest: removes the lowest die roll (for rerolling, pair with dice param)
  function updateProject(update) {
    var newRollData = deepCopy(projectData.rollData);

    if (update.removeLowest) {
      // find the lowest die (skipping the d20 roll)
      let lowestIndex = 0;
      let lowestValue = 100;
      for (var i = 1; i < newRollData.rolls; i++) {
        if (newRollData.rolls[i] < lowestValue) {
          lowestValue = newRollData.rolls[i];
          lowestIndex = i;
        }
      }
      // remove that roll & the associated boon/flaw
      newRollData.rolls.splice(lowestIndex, 1)
      if (lowestValue === 1) newRollData.flawCount -= 1
      if (lowestValue === 6) newRollData.boonCount -= 1
    }

    if (update.dice) {
      for (var j = 0; j < update.dice; j++) {
        const roll = getRandomInt(6);
        newRollData.rolls.push(roll);
        if (roll === 1) newRollData.flawCount += 1
        if (roll === 6) newRollData.boonCount += 1
      }
    }

    if (update.roll) {
      newRollData.rolls.push(update.roll);
      if (update.roll === 1) newRollData.flawCount += 1
      if (update.roll === 6) newRollData.boonCount += 1
    }

    if (update.bonus) newRollData.bonuses.push(update.bonus);

    if (update.boonCount) newRollData.boonCount += update.boonCount;
    if (update.flawCount) newRollData.flawCount += update.flawCount;

    var newTechniqueData = deepCopy(projectData.techniques);
    if (update.technique) newTechniqueData.push(update.technique);

    var newTechniqueDetails = deepCopy(projectData.techniqueDetails);
    if (update.techniqueDetails) newTechniqueDetails = {...newTechniqueDetails, ...update.techniqueDetails}



    updateProjectData({
      rollData: newRollData,
      techniques: newTechniqueData,
      techniqueDetails: newTechniqueDetails
    });
  }

  const tier = crafterData.tier;
  const craftRollSucceeded = didProjectSucceed(projectData, crafterData);

  // ======== TECHNIQUE DATA ======== //
  var welcomingWorkshopBonus = 3;
  if (projectData.techniqueDetails.welcomingWorkshopBonus) {
    welcomingWorkshopBonus = parseInt(projectData.techniqueDetails.welcomingWorkshopBonus);
  }

  var blessedRollOne, blessedRollTwo;
  if (projectUsedTechnique(projectData, 'blessedCreation')) {
    blessedRollOne = parseInt(projectData.techniqueDetails.blessedCreationRollOne);
    blessedRollTwo = parseInt(projectData.techniqueDetails.blessedCreationRollTwo);
  }

  const manufacturerCount = getManufacturerCount(projectData);

  const subtextSelection = projectData.techniqueDetails.subtext;

  return (
    <div className='FineTuning'>
      <h2 className="fine-tune">~ Fine-tuning ~</h2>


      <div className='flaws-and-boons'>
        <div className='flaws'>
          <div className='icon-container'>
            { projectData.rollData.flawCount > 0 ?
              [...Array(projectData.rollData.flawCount)].map(
                (flaw, i) => (
                  <BoonFlawIcon
                    isBoon={false}
                    isCancelled={i >= (projectData.rollData.flawCount - cancelledCount)}
                    handleClick={(isCancelled) => handleBoonFlawClick(isCancelled)}
                    key={i}
                  />
                )
              )
            :
              <hr />
            }
          </div>
          <div className='label-container'>
            { flawStack.length > 0 ?
              flawStack.map(
                (flawSize, i) => (
                  <div className='label' key={i}>{allFlaws[flawSize]}</div>
                )
              )
            :
              <div className='label'>Flawless</div>
            }
          </div>
        </div>

        <div className='boons'>
          <div className='icon-container'>
            { projectData.rollData.boonCount > 0 ?
              [...Array(projectData.rollData.boonCount)].map(
                (boon, i) => (
                  <BoonFlawIcon
                    isBoon={true}
                    isCancelled={i >= (projectData.rollData.boonCount - cancelledCount)}
                    handleClick={(isCancelled) => handleBoonFlawClick(isCancelled)}
                    key={i}
                  />
                )
              )
            :
              <hr />
            }
          </div>
          <div className='label-container'>
            { boonStack.length > 0 ?
              boonStack.map(
                (boonSize, i) => (
                  <div className='label' key={i}>{allBoons[boonSize]}</div>
                )
              )
            :
              <div className='label'>No boons</div>
            }
          </div>
        </div>
      </div>

      <div className='add-dice-container'>
        { projectUsedTechnique(projectData, 'desperateMeasures') ?
          <div className="used">Used desparate measures.</div>
        : !craftRollSucceeded &&
          <div className='technique-container'>
            <div className="label">Desparate Measures:</div>
            <button onClick={() => updateProject({flawCount: 1, bonus: 3, technique: 'desperateMeasures'}) }>
              Add +3 and a flaw
            </button>
          </div>
        }

        { crafterHasTechnique(crafterData, 'finishingTouches') &&
          ( projectUsedTechnique(projectData, 'finishingTouches') ?
            <div className="used">Used finishing touches.</div>
          :
            <div className='technique-container'>
              <div className="label">Finishing touches: </div>
              <button onClick={() => updateProject({removeLowest: true, dice: 1, technique: 'finishingTouches'}) }>
                Reroll lowest die
              </button>
              { projectData.rollData.flawCount > 0 &&
                <button onClick={() => updateProject({flawCount: -1, technique: 'finishingTouches'}) }>
                  Remove a flaw
                </button>
              }
              <button onClick={() => updateProject({boonCount: 1, technique: 'finishingTouches'}) }>
                Add a boon
              </button>
            </div>
          )
        }

        { crafterHasTechnique(crafterData, 'finishingTouches') &&
          ( (projectUsedTechnique(projectData, 'finishingTouches') && projectData.techniqueDetails.doubleFinishingTouches) ?
            <div className="used">Used finishing touches (tier 4).</div>
          :
            <div className='technique-container'>
              <div className="label">Finishing touches (tier 4): </div>
              <button onClick={() => updateProject({removeLowest: true, dice: 1, technique: 'finishingTouches', techniqueDetails: {doubleFinishingTouches:true} }) }>
                Reroll lowest die
              </button>
              { projectData.rollData.flawCount > 0 &&
                <button onClick={() => updateProject({flawCount: -1, technique: 'finishingTouches', techniqueDetails: {doubleFinishingTouches:true} }) }>
                  Remove a flaw
                </button>
              }
              <button onClick={() => updateProject({boonCount: 1, technique: 'finishingTouches', techniqueDetails: {doubleFinishingTouches:true} }) }>
                Add a boon
              </button>
            </div>
          )
        }

        { crafterHasTechnique(crafterData, 'inheritedTools') && (tier >= 2) &&
          ( projectUsedTechnique(projectData, 'inheritedTools') ?
            <div className="used">Used inherited tools.</div>
          : !craftRollSucceeded &&
            <div className='technique-container'>
              <div className="label">Inherited Tools</div>
              <button onClick={() => updateProject({dice: (tier >= 4 ? 2 : 1), technique: 'inheritedTools'}) }>
                Add +{(tier >= 4 ? 2 : 1)}d6
              </button>
            </div>
          )
        }

        { crafterHasTechnique(crafterData, 'welcomingWorkshop') &&
          ( projectUsedTechnique(projectData, 'welcomingWorkshop') ?
            <div className="used">Used welcoming workshop.</div>
          :
            <div className='technique-container'>
              <div className="label">Welcoming workshop</div>
              <NumberInput
                value={welcomingWorkshopBonus}
                setValue={(value) => updateProject({techniqueDetails: {welcomingWorkshopBonus: value}}) }
                minValue={1}
                maxValue={6}
                prefix={"+"}
              />
              <button onClick={() => updateProject({roll: welcomingWorkshopBonus, technique: 'welcomingWorkshop'}) }>
                Add
              </button>
            </div>
          )
        }

        { crafterHasTechnique(crafterData, 'comfortZone') &&
          ( projectUsedTechnique(projectData, 'comfortZone') ?
            <div className="used">Used comfort zone.</div>
          :
            <div className='technique-container'>
              <div className="label">Comfort Zone:</div>
              <button onClick={() => updateProject({bonus: 5, technique: 'comfortZone'}) }>
                Add +5
              </button>
              <button onClick={() => updateProject({boonCount: 1, technique: 'comfortZone'}) }>
                Add a boon
              </button>
            </div>
          )
        }

        { crafterHasTechnique(crafterData, 'blessedCreation') &&
          ( projectUsedTechnique(projectData, 'blessedCreation') ?
            <div className='technique-container'>
              <div className="label used">Used blessed creation.</div>
              <button
                onClick={() => updateProject({
                  roll: blessedRollOne,
                  techniqueDetails: { blessedCreationRollOne: -1*blessedRollOne }
                })}
                disabled={blessedRollOne <= 0}
              >
                Additional roll: +{Math.abs(blessedRollOne)}
              </button>
              <button
                onClick={() => updateProject({
                  roll: blessedRollTwo,
                  techniqueDetails: { blessedCreationRollTwo: -1*blessedRollTwo }
                })}
                disabled={blessedRollTwo <= 0}
              >
                Additional roll: +{Math.abs(blessedRollTwo)}
              </button>
            </div>
          :
            <div className='technique-container'>
              <div className="label">Blessed Creation:</div>
              <button onClick={() => updateProject({
                bonus: 5,
                technique: 'blessedCreation',
                techniqueDetails: {
                  blessedCreationRollOne: getRandomInt(6),
                  blessedCreationRollTwo: getRandomInt(6)
                }
              }) }>
                Add +5 and additional options
              </button>
            </div>
          )
        }

        { (crafterHasTechnique(crafterData, 'manufacturer') && (manufacturerCount > 1)) &&
          ( projectUsedTechnique(projectData, 'manufacturer') ?
            <div className="used">Used manufacturer to make {manufacturerCount} copies.</div>
          :
            <div className='technique-container'>
              <div className="label">Manufacturer:</div>
              <button onClick={() => updateProject({technique: 'manufacturer'}) }>
                Create {manufacturerCount} copies
              </button>
            </div>
          )
        }

        { crafterHasTechnique(crafterData, 'subtext') &&
          ( projectUsedTechnique(projectData, 'subtext') ?
            <div className="used">Used subtext: {subtextSelection}.</div>
          :
            <div className='technique-container'>
              <div className="label">Subtext:</div>
              <button onClick={() => updateProject({techniqueDetails: {subtext: 'Animated'}, technique: 'subtext'}) }>
                Animated
              </button>
              <button onClick={() => updateProject({techniqueDetails: {subtext: 'Hidden Message'}, technique: 'subtext'}) }>
                Hidden Message
              </button>
              <button onClick={() => updateProject({techniqueDetails: {subtext: 'Emotion'}, technique: 'subtext'}) }>
                Emotion
              </button>
            </div>
          )
        }

        {/*<div className='technique-container'>
          <div className="label">Manual Adjustment</div>
          <NumberInput
            value={manualAddValue}
            setValue={(value) => setManualAddValue(value) }
            minValue={-20}
            maxValue={20}
            prefix={manualAddValue >= 0 ? '+' : ''}
          />
          <button onClick={() => updateProject({bonus: manualAddValue}) }>
            Add
          </button>
        </div> */}

      </div>
    </div>
  )
}

const BoonFlawIcon = ({
  isBoon,
  isCancelled,
  handleClick
}) => {
  var classes = 'asset ';
  classes += isBoon ? 'radiant ' : 'necrotic ';
  classes += isCancelled ? 'cancelled' : '';

  return (
    <div className='BoonFlawIcon' onClick={() => handleClick(isCancelled)}>
      <div className={classes} />
    </div>
  )
}

export default FineTuning ;
